import React, { PropsWithChildren, useMemo } from "react";
import { makeAutoObservable, reaction } from "mobx";
import { Nullable } from "tsdef";

import { OrderType, UserInfo } from "@compolabs/spark-orderbook-ts-sdk";

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
  private subscriptionToOrdersStats: Nullable<Subscription> = null;

  myOrders: SpotMarketOrder[] = [];
  myOrdersHistory: SpotMarketOrder[] = [];
  myOrdersStats: UserInfo | null = null;

  isOrderCancelling = false;
  cancelingOrderId: Nullable<string> = null;
  isWithdrawing = false;
  withdrawingAssetId: Nullable<string> = null;

  isOpenOrdersLoaded = false;
  isHistoryOrdersLoaded = false;

  // filters
  offset = 0;
  limit = 10;

  filterIsSellOrderTypeEnabled = true;
  filterIsBuyOrderTypeEnabled = true;
  toggleFilterOrderType = (orderType: OrderType) => {
    if (orderType === OrderType.Sell) {
      if (this.filterIsSellOrderTypeEnabled && !this.filterIsBuyOrderTypeEnabled) {
        this.filterIsSellOrderTypeEnabled = false;
        this.filterIsBuyOrderTypeEnabled = true;
        return;
      }
      this.filterIsSellOrderTypeEnabled = !this.filterIsSellOrderTypeEnabled;
      return;
    }

    if (this.filterIsBuyOrderTypeEnabled && !this.filterIsSellOrderTypeEnabled) {
      // Cannot uncheck 'buy' because 'sell' is already unchecked
      this.filterIsBuyOrderTypeEnabled = false;
      this.filterIsSellOrderTypeEnabled = true;
      return;
    }
    this.filterIsBuyOrderTypeEnabled = !this.filterIsBuyOrderTypeEnabled;
  };

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
    const { accountStore, tradeStore } = this.rootStore;
    reaction(
      () => [tradeStore.market, this.rootStore.initialized, accountStore.isConnected, this.tableFilters],
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

  get tableFilters() {
    const orderType =
      this.filterIsSellOrderTypeEnabled && this.filterIsBuyOrderTypeEnabled
        ? undefined
        : this.filterIsSellOrderTypeEnabled
          ? OrderType.Sell
          : OrderType.Buy;

    return {
      limit: this.limit,
      offset: this.offset,
      orderType,
    };
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
      const bcNetworkCopy = await bcNetwork.chain();
      const tx = await bcNetworkCopy.writeWithMarket(order.market).cancelOrder(order.id);
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

  private subscribeToOpenOrders = (sortDesc: OrderSortingFunction) => {
    const { accountStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (this.subscriptionToOpenOrders) {
      this.subscriptionToOpenOrders.unsubscribe();
    }

    this.subscriptionToOpenOrders = bcNetwork
      .subscribeSpotOrders({
        ...this.tableFilters,
        user: accountStore.address!,
        status: ["Active"],
      })
      .subscribe({
        next: ({ data }) => {
          if (!data) return;
          const sortedOrder = formatSpotMarketOrders(data.Order, CONFIG.TOKENS_BY_SYMBOL.KMLA.assetId).sort(sortDesc);
          this.setMyOrders(sortedOrder);

          if (!this.isOpenOrdersLoaded) {
            this.isOpenOrdersLoaded = true;
          }
        },
      });
  };

  private subscribeToHistoryOrders = (sortDesc: OrderSortingFunction) => {
    const { accountStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (this.subscriptionToHistoryOrders) {
      this.subscriptionToHistoryOrders.unsubscribe();
    }
    this.subscriptionToHistoryOrders = bcNetwork
      .subscribeSpotOrders({
        ...this.tableFilters,
        user: accountStore.address!,
        status: ["Closed", "Canceled"],
      })
      .subscribe({
        next: ({ data }) => {
          if (!data) return;
          const sortedOrdersHistory = formatSpotMarketOrders(data.Order, CONFIG.TOKENS_BY_SYMBOL.KMLA.assetId).sort(
            sortDesc,
          );
          this.setMyOrdersHistory(sortedOrdersHistory);

          if (!this.isHistoryOrdersLoaded) {
            this.isHistoryOrdersLoaded = true;
          }
        },
      });
  };

  private subscribeUserInfo = () => {
    const bcNetwork = FuelNetwork.getInstance();
    const { accountStore } = this.rootStore;
    this.subscriptionToOrdersStats = bcNetwork
      .subscribeUserInfo({
        id: accountStore.address!,
      })
      .subscribe({
        next: ({ data }: any) => {
          if (!data.User.length) {
            return;
          }
          this.setMyOrdersStats(data.User[0]);
        },
      });
  };
  private subscribeToOrders = () => {
    const sortDesc = (a: SpotMarketOrder, b: SpotMarketOrder) => b.timestamp.valueOf() - a.timestamp.valueOf();

    this.subscribeToOpenOrders(sortDesc);
    this.subscribeToHistoryOrders(sortDesc);
    this.subscribeUserInfo();
  };

  private setMyOrders = (myOrders: SpotMarketOrder[]) => (this.myOrders = myOrders);

  private setMyOrdersHistory = (myOrdersHistory: SpotMarketOrder[]) => (this.myOrdersHistory = myOrdersHistory);

  private setMyOrdersStats = (myOrdersStats: UserInfo) => (this.myOrdersStats = myOrdersStats);
  setOffset = (currentPage: number) => {
    if (currentPage === 0) {
      this.offset = 0;
      return;
    }

    this.offset = (currentPage - 1) * this.limit;
  };
}
