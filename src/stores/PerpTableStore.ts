import { makeAutoObservable, reaction } from "mobx";
import { Nullable } from "tsdef";

import { OrderType, UserInfo } from "@compolabs/spark-orderbook-ts-sdk";

import { RootStore } from "@stores";

import { ACTION_MESSAGE_TYPE, getActionMessage } from "@utils/getActionMessage";
import { handleWalletErrors } from "@utils/handleWalletErrors";

import { FuelNetwork } from "@blockchain";
import { PerpMarketOrder, SpotMarket } from "@entity";

import { Subscription } from "@src/typings/utils";

const sortDesc = (a: PerpMarketOrder, b: PerpMarketOrder) => b.timestamp.valueOf() - a.timestamp.valueOf();

export const PAGINATION_LIMIT = 10;

export class PerpTableStore {
  private readonly rootStore: RootStore;
  private subscriptionToOpenOrders: Nullable<Subscription> = null;
  private subscriptionToHistoryOrders: Nullable<Subscription> = null;
  private subscriptionToOrdersStats: Nullable<Subscription> = null;

  userOrders: PerpMarketOrder[] = [];
  private setUserOrders = (orders: PerpMarketOrder[]) => (this.userOrders = orders);

  userOrdersHistory: PerpMarketOrder[] = [];
  private setUserOrdersHistory = (orders: PerpMarketOrder[]) => (this.userOrdersHistory = orders);

  userOrdersStats: Nullable<UserInfo> = null;
  private setUserOrdersStats = (stats: UserInfo) => (this.userOrdersStats = stats);

  isOrderCancelling = false;
  cancelingOrderId: Nullable<string> = null;
  isWithdrawing = false;
  withdrawingAssetId: Nullable<string> = null;

  isOpenOrdersLoaded = false;
  isHistoryOrdersLoaded = false;

  offset = 0;
  setOffset = (currentPage: number) => {
    if (currentPage === 0) {
      this.offset = 0;
      return;
    }

    this.offset = (currentPage - 1) * PAGINATION_LIMIT;
  };

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
    const { accountStore, marketStore } = this.rootStore;
    reaction(
      () => [marketStore.market, this.rootStore.initialized, accountStore.isConnected, this.tableFilters] as const,
      ([market, initialized, isConnected, _]) => {
        const isSpotMarket = market && SpotMarket.isInstance(market);

        if (!isSpotMarket || !initialized || !isConnected) {
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
      limit: PAGINATION_LIMIT,
      offset: this.offset,
      orderType,
    };
  }

  resetCounter = () => {
    this.userOrdersStats = null;
  };

  cancelOrder = async (order: PerpMarketOrder) => {
    const { notificationStore, marketStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!marketStore.market) return;

    this.isOrderCancelling = true;
    this.cancelingOrderId = order.id;
    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.info({
        text: "Please, confirm operation in your wallet",
      });
    }

    try {
      const bcNetworkCopy = await bcNetwork.spotChain();
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
    const { balanceStore } = this.rootStore;

    this.isWithdrawing = true;
    this.withdrawingAssetId = assetId;

    const amount = balanceStore.getSpotContractBalance(assetId);
    await balanceStore.withdrawSpotBalance(assetId, amount.toString());

    this.isWithdrawing = false;
    this.withdrawingAssetId = null;
  };

  private subscribeToOpenOrders = () => {
    const { accountStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (this.subscriptionToOpenOrders) {
      this.subscriptionToOpenOrders.unsubscribe();
    }

    this.subscriptionToOpenOrders = bcNetwork
      .spotSubscribeOrders({
        ...this.tableFilters,
        user: accountStore.address!,
        status: ["Active"],
      })
      .subscribe({
        next: ({ data }) => {
          if (!data) return;

          const sortedOrder = data.Order.map((order) => new PerpMarketOrder(order)).sort(sortDesc);
          this.setUserOrders(sortedOrder);

          if (!this.isOpenOrdersLoaded) {
            this.isOpenOrdersLoaded = true;
          }
        },
      });
  };

  private subscribeToHistoryOrders = () => {
    const { accountStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (this.subscriptionToHistoryOrders) {
      this.subscriptionToHistoryOrders.unsubscribe();
    }
    this.subscriptionToHistoryOrders = bcNetwork
      .spotSubscribeOrders({
        ...this.tableFilters,
        user: accountStore.address!,
        status: ["Closed", "Canceled"],
      })
      .subscribe({
        next: ({ data }) => {
          if (!data) return;

          const sortedOrdersHistory = data.Order.map((order) => new PerpMarketOrder(order)).sort(sortDesc);
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
    const bcNetwork = FuelNetwork.getInstance();
    const { accountStore } = this.rootStore;

    if (this.subscriptionToOrdersStats) {
      this.subscriptionToOrdersStats.unsubscribe();
    }

    this.subscriptionToOrdersStats = bcNetwork
      .spotSubscribeUserInfo({
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
}
