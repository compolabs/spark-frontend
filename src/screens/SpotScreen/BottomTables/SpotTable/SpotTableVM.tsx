import React, { PropsWithChildren, useMemo } from "react";
import { makeAutoObservable, reaction } from "mobx";
import { Nullable } from "tsdef";

import useVM from "@hooks/useVM";
import { RootStore, useStores } from "@stores";

import { formatSpotMarketOrders } from "@utils/formatSpotMarketOrders";
import { ACTION_MESSAGE_TYPE, getActionMessage } from "@utils/getActionMessage";
import { CONFIG } from "@utils/getConfig";
import { handleWalletErrors } from "@utils/handleWalletErrors";

import { FuelNetwork } from "@blockchain";
import { SpotMarketOrder } from "@entity";

import { Subscription } from "@src/typings/utils";

const ctx = React.createContext<SpotTableVM | null>(null);

export const SpotTableVMProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new SpotTableVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useSpotTableVMProvider = () => useVM(ctx);

type OrderSortingFunction = (a: SpotMarketOrder, b: SpotMarketOrder) => number;

class SpotTableVM {
  private readonly rootStore: RootStore;
  private subscriptionToOpenOrders: Nullable<Subscription> = null;
  private subscriptionToHistoryOrders: Nullable<Subscription> = null;

  myOrders: SpotMarketOrder[] = [];
  myOrdersHistory: SpotMarketOrder[] = [];

  isOrderCancelling = false;
  cancelingOrderId: Nullable<string> = null;
  isWithdrawing = false;
  withdrawingAssetId: Nullable<string> = null;

  isOpenOrdersLoaded = false;
  isHistoryOrdersLoaded = false;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
    const { accountStore, tradeStore } = this.rootStore;

    reaction(
      () => [tradeStore.market, this.rootStore.initialized, accountStore.isConnected],
      ([market, initialized, isConnected]) => {
        if (!initialized || !market || !isConnected) {
          this.setMyOrders([]);
          this.setMyOrdersHistory([]);
          return;
        }

        this.subscribeToOrders();
      },
      { fireImmediately: true },
    );
  }

  get initialized() {
    return this.isOpenOrdersLoaded && this.isHistoryOrdersLoaded;
  }

  cancelOrder = async (order: SpotMarketOrder) => {
    const { notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!this.rootStore.tradeStore.market) return;

    this.isOrderCancelling = true;
    this.cancelingOrderId = order.id;
    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.info({
        text: "Please, confirm operation in your wallet",
      });
    }

    try {
      const tx = await bcNetwork?.cancelSpotOrder(order.id);
      notificationStore.success({
        text: getActionMessage(ACTION_MESSAGE_TYPE.CANCELING_ORDER)(),
        hash: tx.transactionId,
      });
    } catch (error: any) {
      handleWalletErrors(notificationStore, error, getActionMessage(ACTION_MESSAGE_TYPE.CANCELING_ORDER_FAILED)());
    }

    this.isOrderCancelling = false;
    this.cancelingOrderId = null;
  };

  withdrawBalance = async (assetId: string) => {
    this.isWithdrawing = true;
    this.withdrawingAssetId = assetId;

    const { amount } = this.rootStore.balanceStore.getContractBalanceInfo(assetId);
    await this.rootStore.balanceStore.withdrawBalance(assetId, amount.toString());

    this.isWithdrawing = false;
    this.withdrawingAssetId = null;
  };

  private subscribeToOpenOrders = (sortDesc: OrderSortingFunction, limit = 100) => {
    const { accountStore, tradeStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (this.subscriptionToOpenOrders) {
      this.subscriptionToOpenOrders.unsubscribe();
    }

    this.subscriptionToOpenOrders = bcNetwork
      .subscribeSpotOrders({
        limit,
        asset: tradeStore.market!.baseToken.assetId,
        user: accountStore.address!,
        status: ["Active"],
      })
      .subscribe({
        next: ({ data }) => {
          if (!data) return;

          const sortedOrder = formatSpotMarketOrders(data.Order, CONFIG.TOKENS_BY_SYMBOL.USDC.assetId).sort(sortDesc);
          this.setMyOrders(sortedOrder);

          if (!this.isOpenOrdersLoaded) {
            this.isOpenOrdersLoaded = true;
          }
        },
      });
  };

  private subscribeToHistoryOrders = (sortDesc: OrderSortingFunction, limit = 100) => {
    const { accountStore, tradeStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (this.subscriptionToHistoryOrders) {
      this.subscriptionToHistoryOrders.unsubscribe();
    }

    this.subscriptionToHistoryOrders = bcNetwork
      .subscribeSpotOrders({
        limit,
        asset: tradeStore.market!.baseToken.assetId,
        user: accountStore.address!,
        status: ["Closed", "Canceled"],
      })
      .subscribe({
        next: ({ data }) => {
          if (!data) return;

          const sortedOrdersHistory = formatSpotMarketOrders(data.Order, CONFIG.TOKENS_BY_SYMBOL.USDC.assetId).sort(
            sortDesc,
          );
          this.setMyOrdersHistory(sortedOrdersHistory);

          if (!this.isHistoryOrdersLoaded) {
            this.isHistoryOrdersLoaded = true;
          }
        },
      });
  };

  private subscribeToOrders = () => {
    const sortDesc = (a: SpotMarketOrder, b: SpotMarketOrder) => b.timestamp.valueOf() - a.timestamp.valueOf();

    this.subscribeToOpenOrders(sortDesc);
    this.subscribeToHistoryOrders(sortDesc);
  };

  private setMyOrders = (myOrders: SpotMarketOrder[]) => (this.myOrders = myOrders);

  private setMyOrdersHistory = (myOrdersHistory: SpotMarketOrder[]) => (this.myOrdersHistory = myOrdersHistory);
}
