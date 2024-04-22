import React, { PropsWithChildren, useMemo } from "react";
import { Dayjs } from "dayjs";
import { makeAutoObservable, reaction, when } from "mobx";
import { Nullable } from "tsdef";

import { createToast } from "@src/components/Toast";
import { SpotMarketOrder, SpotMarketTrade } from "@src/entity";
import useVM from "@src/hooks/useVM";
import { hanldeWalletErrors } from "@src/utils/handleWalletErrors";
import { IntervalUpdater } from "@src/utils/IntervalUpdater";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<SpotTableVM | null>(null);

export const SpotTableVMProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new SpotTableVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useSpotTableVMProvider = () => useVM(ctx);

const ORDERS_UPDATE_INTERVAL = 10 * 1000; // 10 sec

class SpotTableVM {
  myOrders: SpotMarketOrder[] = [];
  myOrdersHistory: SpotMarketTrade[] = [];
  initialized: boolean = false;

  isOrderCancelling = false;
  cancelingOrderId: Nullable<string> = null;

  private readonly rootStore: RootStore;

  private ordersUpdater: IntervalUpdater;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
    const { tradeStore, accountStore } = this.rootStore;

    when(
      () => !!tradeStore.market,
      () => this.sync().then(() => this.setInitialized(true)),
    );

    this.ordersUpdater = new IntervalUpdater(this.sync, ORDERS_UPDATE_INTERVAL);

    this.ordersUpdater.run(true);

    reaction(
      () => [accountStore.isConnected, accountStore.address],
      ([isConnected]) => {
        if (!isConnected) {
          this.setMyOrders([]);
          return;
        }

        this.ordersUpdater.update();
      },
    );
  }

  cancelOrder = async (orderId: string) => {
    const { notificationStore, blockchainStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;

    if (!this.rootStore.tradeStore.market) return;

    this.isOrderCancelling = true;
    this.cancelingOrderId = orderId;
    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.toast(createToast({ text: "Please, confirm operation in your wallet" }), { type: "info" });
    }

    try {
      await bcNetwork?.cancelSpotOrder(orderId);
      notificationStore.toast(createToast({ text: "Order canceled!" }), { type: "success" });
    } catch (error) {
      hanldeWalletErrors(notificationStore, error, "We were unable to cancel your order at this time");
    }

    this.isOrderCancelling = false;
    this.cancelingOrderId = null;
  };

  private sync = async () => {
    const { accountStore, tradeStore, blockchainStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;

    if (!tradeStore.market || !accountStore.address) return;

    const { market } = tradeStore;

    const sortDesc = (a: { timestamp: Dayjs }, b: { timestamp: Dayjs }) =>
      b.timestamp.valueOf() - a.timestamp.valueOf();

    try {
      const [ordersData, ordersHistoryData] = await Promise.all([
        bcNetwork!.fetchSpotOrders({
          baseToken: market.baseToken.assetId,
          limit: 100,
          trader: accountStore.address,
          isActive: true,
        }),
        bcNetwork!.fetchSpotTrades({
          baseToken: market.baseToken.assetId,
          limit: 100,
          trader: accountStore.address,
        }),
      ]);

      const sortedOrder = ordersData.sort(sortDesc);
      const sortedOrdersHistory = ordersHistoryData.sort(sortDesc);
      this.setMyOrders(sortedOrder);
      this.setMyOrdersHistory(sortedOrdersHistory);
    } catch (error) {
      console.error(error);
    }
  };

  private setMyOrders = (myOrders: SpotMarketOrder[]) => (this.myOrders = myOrders);

  private setMyOrdersHistory = (myOrdersHistory: SpotMarketTrade[]) => (this.myOrdersHistory = myOrdersHistory);

  private setInitialized = (l: boolean) => (this.initialized = l);
}
