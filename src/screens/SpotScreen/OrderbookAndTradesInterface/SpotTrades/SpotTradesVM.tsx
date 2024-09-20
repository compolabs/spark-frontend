import React, { PropsWithChildren, useMemo } from "react";
import { makeAutoObservable, reaction } from "mobx";

import useVM from "@hooks/useVM";
import { RootStore, useStores } from "@stores";

import { FuelNetwork } from "@blockchain";
import { SpotMarketTrade } from "@entity";

const ctx = React.createContext<SpotTradesVM | null>(null);

export const SpotTradesVMProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new SpotTradesVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useSpotTradesVM = () => useVM(ctx);

class SpotTradesVM {
  public trades: SpotMarketTrade[] = [];

  isInitialLoadComplete = false;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    reaction(
      () => [this.rootStore.tradeStore.market, this.rootStore.initialized],
      ([market, initialized]) => {
        if (!initialized || !market) return;

        this.subscribeTrades();
      },
      { fireImmediately: true },
    );
  }

  subscribeTrades = () => {
    const { tradeStore } = this.rootStore;
    const market = tradeStore.market;

    const bcNetwork = FuelNetwork.getInstance();

    bcNetwork
      .subscribeSpotTradeOrderEvents({
        limit: 50,
      })
      .subscribe({
        next: ({ data }) => {
          if (!data) return;

          const trades = data.TradeOrderEvent.map(
            (trade) =>
              new SpotMarketTrade({
                ...trade,
                baseAssetId: market!.baseToken.assetId,
                quoteAssetId: market!.quoteToken.assetId,
              }),
          );

          this.trades = trades;

          if (!this.isInitialLoadComplete) {
            this.isInitialLoadComplete = true;
          }
        },
      });
  };

  get isTradesLoading() {
    return !this.isInitialLoadComplete;
  }
}
