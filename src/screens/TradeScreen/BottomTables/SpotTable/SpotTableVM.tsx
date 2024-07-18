import React, { PropsWithChildren, useMemo } from "react";
import { AssetType, BN, UserMarketBalance } from "@compolabs/spark-orderbook-ts-sdk";
import { Dayjs } from "dayjs";
import { makeAutoObservable, reaction, when } from "mobx";
import { Nullable } from "tsdef";

import { FuelNetwork } from "@src/blockchain";
import { createToast } from "@src/components/Toast";
import { SpotMarketOrder } from "@src/entity";
import useVM from "@src/hooks/useVM";
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

const ORDERS_UPDATE_INTERVAL = 5 * 1000; // 5 sec

class SpotTableVM {
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
  initialized: boolean = false;

  isOrderCancelling = false;
  cancelingOrderId: Nullable<string> = null;
  isWithdrawing = false;
  withdrawingAssetId: Nullable<string> = null;

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

      this.sync();
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

      this.sync();
    } catch (error) {
      console.error(error);
      handleWalletErrors(notificationStore, error, "We were unable to withdraw your token at this time");
    }

    this.isWithdrawing = false;
    this.withdrawingAssetId = null;
  };

  private sync = async () => {
    const { accountStore, tradeStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!tradeStore.market || !accountStore.address) return;

    const { market } = tradeStore;

    const sortDesc = (a: { timestamp: Dayjs }, b: { timestamp: Dayjs }) =>
      b.timestamp.valueOf() - a.timestamp.valueOf();

    const limit = 500;

    try {
      const [ordersData, ordersHistoryData, balanceData] = await Promise.all([
        bcNetwork!.fetchSpotOrders({
          limit,
          asset: market.baseToken.assetId,
          user: accountStore.address0x,
          status: ["Active"],
        }),
        bcNetwork!.fetchSpotOrders({
          limit,
          asset: market.baseToken.assetId,
          user: accountStore.address0x,
          status: ["Closed", "Canceled"],
        }),
        bcNetwork!.fetchSpotUserMarketBalance(accountStore.address as any),
      ]);

      const sortedOrder = ordersData.sort(sortDesc);
      const sortedOrdersHistory = ordersHistoryData.sort(sortDesc);
      this.setMyOrders(sortedOrder);
      this.setMyOrdersHistory(sortedOrdersHistory);
      this.setMyMarketBalance(balanceData);
    } catch (error) {
      console.error(error);
    }
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

  private setInitialized = (l: boolean) => (this.initialized = l);
}
