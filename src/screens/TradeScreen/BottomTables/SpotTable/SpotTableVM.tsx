import React, { PropsWithChildren, useMemo } from "react";
import { AssetType, BN, UserMarketBalance } from "@compolabs/spark-orderbook-ts-sdk";
import { Address } from "fuels";
import { makeAutoObservable, reaction } from "mobx";
import { Nullable } from "tsdef";

import { FuelNetwork } from "@src/blockchain";
import { TOKENS_BY_SYMBOL } from "@src/blockchain/constants";
import { createToast } from "@src/components/Toast";
import { SpotMarketOrder } from "@src/entity";
import useVM from "@src/hooks/useVM";
import { Subscription } from "@src/typings/utils";
import { formatSpotMarketOrders } from "@src/utils/formatSpotMarketOrders";
import { handleWalletErrors } from "@src/utils/handleWalletErrors";
import { IntervalUpdater } from "@src/utils/IntervalUpdater";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<SpotTableVM | null>(null);

export const SpotTableVMProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new SpotTableVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useSpotTableVMProvider = () => useVM(ctx);

const MARKET_BALANCE_UPDATE_INTERVAL = 15 * 1000; // 15 sec

type OrderSortingFunction = (a: SpotMarketOrder, b: SpotMarketOrder) => number;

class SpotTableVM {
  private readonly rootStore: RootStore;
  private subscriptionToOpenOrders: Nullable<Subscription> = null;
  private subscriptionToHistoryOrders: Nullable<Subscription> = null;

  myOrders: SpotMarketOrder[] = [];
  myOrdersHistory: SpotMarketOrder[] = [];
  myMarketBalance = {
    locked: {
      base: BN.ZERO,
      quote: BN.ZERO,
    },
    liquid: {
      base: BN.ZERO,
      quote: BN.ZERO,
    },
  };

  isOrderCancelling = false;
  cancelingOrderId: Nullable<string> = null;
  isWithdrawing = false;
  withdrawingAssetId: Nullable<string> = null;

  isOpenOrdersLoaded = false;
  isHistoryOrdersLoaded = false;

  private marketBalanceUpdater: IntervalUpdater;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
    const { accountStore, tradeStore } = this.rootStore;

    this.marketBalanceUpdater = new IntervalUpdater(this.fetchUserMarketBalance, MARKET_BALANCE_UPDATE_INTERVAL);
    this.marketBalanceUpdater.run(true);

    reaction(
      () => [tradeStore.market, this.rootStore.initialized, accountStore.isConnected],
      ([market, initialized, isConnected]) => {
        if (!initialized || !market || !isConnected) {
          this.setMyOrders([]);
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

  getContractBalanceInfo = (assetId: string) => {
    const bcNetwork = FuelNetwork.getInstance();

    const token = bcNetwork.getTokenByAssetId(assetId);
    const type = token.symbol === "USDC" ? AssetType.Quote : AssetType.Base;
    const amount = type === AssetType.Quote ? this.myMarketBalance.liquid.quote : this.myMarketBalance.liquid.base;

    return { amount, type };
  };

  cancelOrder = async (order: SpotMarketOrder) => {
    const { notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!this.rootStore.tradeStore.market) return;

    this.isOrderCancelling = true;
    this.cancelingOrderId = order.id;
    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.toast(createToast({ text: "Please, confirm operation in your wallet" }), { type: "info" });
    }

    try {
      await bcNetwork?.cancelSpotOrder(order);
      notificationStore.toast(createToast({ text: "Order canceled!" }), { type: "success" });
    } catch (error) {
      console.error(error);
      handleWalletErrors(notificationStore, error, "We were unable to cancel your order at this time");
    }

    this.isOrderCancelling = false;
    this.cancelingOrderId = null;
  };

  withdrawBalance = async (assetId: string) => {
    const { notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!this.rootStore.tradeStore.market) return;

    this.isWithdrawing = true;
    this.withdrawingAssetId = assetId;

    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.toast(createToast({ text: "Please, confirm operation in your wallet" }), { type: "info" });
    }

    const { amount, type } = this.getContractBalanceInfo(assetId);

    try {
      await bcNetwork?.withdrawSpotBalance(amount.toString(), type);
      notificationStore.toast(createToast({ text: "Withdrawal request has been sent!" }), { type: "success" });
    } catch (error) {
      console.error(error);
      handleWalletErrors(notificationStore, error, "We were unable to withdraw your token at this time");
    }

    this.isWithdrawing = false;
    this.withdrawingAssetId = null;
  };

  private subscribeToOpenOrders = (sortDesc: OrderSortingFunction, limit = 50) => {
    const { accountStore, tradeStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (this.subscriptionToOpenOrders) {
      this.subscriptionToOpenOrders.unsubscribe();
    }

    this.subscriptionToOpenOrders = bcNetwork.orderbookSdk
      .subscribeOrders({
        limit,
        asset: tradeStore.market!.baseToken.assetId,
        user: accountStore.address!,
        status: ["Active"],
      })
      .subscribe({
        next: ({ data }) => {
          if (!data) return;

          const sortedOrder = formatSpotMarketOrders(data.Order, TOKENS_BY_SYMBOL.USDC.assetId).sort(sortDesc);
          this.setMyOrders(sortedOrder);

          if (!this.isOpenOrdersLoaded) {
            this.isOpenOrdersLoaded = true;
          }
        },
      });
  };

  private subscribeToHistoryOrders = (sortDesc: OrderSortingFunction, limit = 50) => {
    const { accountStore, tradeStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (this.subscriptionToHistoryOrders) {
      this.subscriptionToHistoryOrders.unsubscribe();
    }

    this.subscriptionToHistoryOrders = bcNetwork.orderbookSdk
      .subscribeOrders({
        limit,
        asset: tradeStore.market!.baseToken.assetId,
        user: accountStore.address!,
        status: ["Closed", "Canceled"],
      })
      .subscribe({
        next: ({ data }) => {
          if (!data) return;

          const sortedOrdersHistory = formatSpotMarketOrders(data.Order, TOKENS_BY_SYMBOL.USDC.assetId).sort(sortDesc);
          this.setMyOrdersHistory(sortedOrdersHistory);

          if (!this.isHistoryOrdersLoaded) {
            this.isHistoryOrdersLoaded = true;
          }
        },
      });
  };

  private fetchUserMarketBalance = async () => {
    const { accountStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!accountStore.address) return;

    try {
      // TODO: After type fix in sdk
      const address = Address.fromB256(accountStore.address);
      const balanceData = await bcNetwork.fetchSpotUserMarketBalance(address.bech32Address);
      this.setMyMarketBalance(balanceData);
    } catch (error) {
      console.error(error);
    }
  };

  private subscribeToOrders = () => {
    const sortDesc = (a: SpotMarketOrder, b: SpotMarketOrder) => b.timestamp.valueOf() - a.timestamp.valueOf();

    this.subscribeToOpenOrders(sortDesc);
    this.subscribeToHistoryOrders(sortDesc);
  };

  private setMyOrders = (myOrders: SpotMarketOrder[]) => (this.myOrders = myOrders);

  private setMyOrdersHistory = (myOrdersHistory: SpotMarketOrder[]) => (this.myOrdersHistory = myOrdersHistory);

  private setMyMarketBalance = (balance: UserMarketBalance) =>
    (this.myMarketBalance = {
      liquid: {
        base: new BN(balance.liquid.base),
        quote: new BN(balance.liquid.quote),
      },
      locked: {
        base: new BN(balance.locked.base),
        quote: new BN(balance.locked.quote),
      },
    });
}
