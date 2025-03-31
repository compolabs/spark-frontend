import React, { PropsWithChildren, useMemo } from "react";
import { makeAutoObservable, reaction } from "mobx";
import { Nullable } from "tsdef";

import useVM from "@hooks/useVM";
import { RootStore, useStores } from "@stores";

import { formatSpotMarketOrders } from "@utils/formatSpotMarketOrders";
import { ACTION_MESSAGE_TYPE, getActionMessage } from "@utils/getActionMessage";
import { handleWalletErrors } from "@utils/handleWalletErrors";

import { Blockchain } from "@blockchain";
import { OrderType, UserInfo } from "@blockchain/fuel/types";
import { SpotMarketOrder } from "@entity";

import { Subscription } from "@src/typings/utils";

const ctx = React.createContext<SpotTableVM | null>(null);

export const SpotTableVMProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new SpotTableVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useSpotTableVMProvider = () => useVM(ctx);

const sortDesc = (a: SpotMarketOrder, b: SpotMarketOrder) => b.timestamp.valueOf() - a.timestamp.valueOf();

class SpotTableVM {
  private readonly rootStore: RootStore;
  private subscriptionToOpenOrders: Nullable<Subscription> = null;
  private subscriptionToHistoryOrders: Nullable<Subscription> = null;
  private subscriptionToOrdersStats: Nullable<Subscription> = null;

  userOrders: SpotMarketOrder[] = [];
  userOrdersHistory: SpotMarketOrder[] = [];
  userOrdersStats: Nullable<UserInfo> = null;

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
      () => [tradeStore.market, this.rootStore.initialized, accountStore.isConnected, this.tableFilters] as const,
      ([market, initialized, isConnected, _]) => {
        if (!initialized || !market || !isConnected) {
          this.setUserOrders([]);
          this.setUserOrdersHistory([]);
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

  resetCounter = () => {
    this.userOrdersStats = null;
  };

  cancelOrder = async (order: SpotMarketOrder) => {
    const { notificationStore } = this.rootStore;
    const bcNetwork = Blockchain.getInstance();

    if (!this.rootStore.tradeStore.market) return;

    this.isOrderCancelling = true;
    this.cancelingOrderId = order.id;
    if (bcNetwork.sdk.getIsExternalWallet()) {
      notificationStore.info({
        text: "Please, confirm operation in your wallet",
      });
    }

    try {
      const bcNetworkCopy = await bcNetwork.sdk.chain();
      const tx = await bcNetworkCopy.writeWithMarket(order.market).cancelOrder(order.id);
      notificationStore.success({
        text: getActionMessage(ACTION_MESSAGE_TYPE.CANCELING_ORDER)(),
        hash: tx.transactionId,
      });
    } catch (error: any) {
      console.error("error", error);
      handleWalletErrors(notificationStore, error, getActionMessage(ACTION_MESSAGE_TYPE.CANCELING_ORDER_FAILED)());
    }

    this.isOrderCancelling = false;
    this.cancelingOrderId = null;
  };

  withdrawBalance = async (assetId: string) => {
    const { balanceStore } = this.rootStore;

    this.isWithdrawing = true;
    this.withdrawingAssetId = assetId;

    const amount = balanceStore.getContractBalance(assetId);
    await balanceStore.withdrawBalance(assetId, amount.toString());

    this.isWithdrawing = false;
    this.withdrawingAssetId = null;
  };

  private subscribeToOpenOrders = () => {
    const { accountStore } = this.rootStore;
    const bcNetwork = Blockchain.getInstance();

    if (this.subscriptionToOpenOrders) {
      this.subscriptionToOpenOrders.unsubscribe();
    }

    this.subscriptionToOpenOrders = bcNetwork.sdk
      .subscribeSpotOrders(
        {
          ...this.tableFilters,
          user: accountStore.address!,
          status: ["Active"],
        },
        { timestamp: "desc" },
      )
      .subscribe({
        next: ({ data }) => {
          if (!data) return;

          const sortedOrder = formatSpotMarketOrders(data.Order).sort(sortDesc);
          this.setUserOrders(sortedOrder);

          if (!this.isOpenOrdersLoaded) {
            this.isOpenOrdersLoaded = true;
          }
        },
      });
  };

  private subscribeToHistoryOrders = () => {
    const { accountStore } = this.rootStore;
    const bcNetwork = Blockchain.getInstance();

    if (this.subscriptionToHistoryOrders) {
      this.subscriptionToHistoryOrders.unsubscribe();
    }

    this.subscriptionToHistoryOrders = bcNetwork.sdk
      .subscribeSpotOrders(
        {
          ...this.tableFilters,
          user: accountStore.address!,
          status: ["Closed", "Canceled"],
        },
        { timestamp: "desc" },
      )
      .subscribe({
        next: ({ data }) => {
          if (!data) return;

          const sortedOrdersHistory = formatSpotMarketOrders(data.Order).sort(sortDesc);
          this.setUserOrdersHistory(sortedOrdersHistory);

          if (!this.isHistoryOrdersLoaded) {
            this.isHistoryOrdersLoaded = true;
          }
        },
      });
  };

  private subscribeToOrders = () => {
    this.subscribeToOpenOrders();
    this.subscribeToHistoryOrders();
    this.subscribeUserInfo();
  };

  private subscribeUserInfo = () => {
    const bcNetwork = Blockchain.getInstance();
    const { accountStore } = this.rootStore;

    if (this.subscriptionToOrdersStats) {
      this.subscriptionToOrdersStats.unsubscribe();
    }

    this.subscriptionToOrdersStats = bcNetwork.sdk
      .subscribeUserInfo({
        id: accountStore.address!,
      })
      .subscribe({
        next: ({ data }: any) => {
          if (!data.User.length) {
            return;
          }
          this.setUserOrdersStats(data.User[0]);
        },
      });
  };

  private setUserOrders = (orders: SpotMarketOrder[]) => (this.userOrders = orders);

  private setUserOrdersHistory = (orders: SpotMarketOrder[]) => (this.userOrdersHistory = orders);

  private setUserOrdersStats = (stats: UserInfo) => (this.userOrdersStats = stats);

  setOffset = (currentPage: number) => {
    const page = currentPage - 1;

    if (page === 0) {
      this.offset = 0;
      return;
    }

    this.offset = page * this.limit;
  };
}
