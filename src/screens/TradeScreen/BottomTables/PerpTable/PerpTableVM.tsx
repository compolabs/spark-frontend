import React, { PropsWithChildren, useMemo } from "react";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { PerpOrder, PerpPosition } from "@src/entity";
import useVM from "@src/hooks/useVM";
import { handleEvmErrors } from "@src/utils/handleEvmErrors";
import { IntervalUpdater } from "@src/utils/IntervalUpdater";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<PerpTableVM | null>(null);

export const PerpTableVMProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new PerpTableVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const usePerpTableVMProvider = () => useVM(ctx);

const ORDERS_UPDATE_INTERVAL = 10 * 1000; // 10 sec

class PerpTableVM {
  myPositions: PerpPosition[] = [];
  myOrders: PerpOrder[] = [];

  cancelingOrderId: Nullable<string> = null;

  private readonly rootStore: RootStore;

  private ordersUpdater: IntervalUpdater;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    this.ordersUpdater = new IntervalUpdater(this.sync, ORDERS_UPDATE_INTERVAL);

    this.ordersUpdater.run(true);
  }

  private sync = async () => {
    const { accountStore, tradeStore, blockchainStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;

    if (!tradeStore.market || !accountStore.address) return;

    const { market } = tradeStore;

    try {
      const [ordersData, positionsData] = await Promise.all([
        bcNetwork!.fetchPerpTraderOrders(accountStore.address, market.baseToken.assetId),
        bcNetwork!.fetchPerpAllTraderPositions(accountStore.address),
      ]);

      this.setMyOrders(ordersData);
      this.setMyPositions(positionsData);
    } catch (error) {
      console.error(error);
    }
  };

  private setMyOrders = (myOrders: PerpOrder[]) => (this.myOrders = myOrders);

  private setMyPositions = (myPositions: PerpPosition[]) => (this.myPositions = myPositions);

  cancelOrder = async (orderId: string) => {
    const { accountStore, tradeStore, blockchainStore, notificationStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;

    if (!tradeStore.market || !accountStore.address) return;

    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.toast("Please, confirm operation in your wallet", { type: "info" });
    }

    this.cancelingOrderId = orderId;
    try {
      await bcNetwork?.removePerpOrder(orderId);
      notificationStore.toast("Order canceled!", { type: "success" });
    } catch (error) {
      handleEvmErrors(notificationStore, error, "We were unable to cancel your order at this time");
    }

    this.cancelingOrderId = null;
  };

  cancelPosition = async () => {
    console.warn("NOT IMPLEMENTED");
  };
}
