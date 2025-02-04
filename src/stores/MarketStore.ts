import { makeAutoObservable, reaction } from "mobx";
import { Nullable, Undefinable } from "tsdef";

import { DEFAULT_MARKET } from "@constants";
import BN from "@utils/BN";
import { CONFIG } from "@utils/getConfig";
import { IntervalUpdater } from "@utils/IntervalUpdater";

import { FuelNetwork } from "@blockchain";
import { PerpMarket, SpotMarket } from "@entity";
import { BaseMarket } from "@entity/BaseMarket";

import RootStore from "./RootStore";

export interface ISerializedMarketStore {
  favMarkets: Nullable<string>;
}

const MARKET_PRICES_UPDATE_INTERVAL = 5 * 1000; // 5 sec

export class MarketStore {
  private readonly rootStore: RootStore;

  favMarkets: string[] = [];
  private setFavMarkets = (v: string[]) => (this.favMarkets = v);

  markets: BaseMarket[] = [];
  private setMarkets = (markets: BaseMarket[]) => (this.markets = markets);

  marketSelectionOpened = false;
  setMarketSelectionOpened = (s: boolean) => (this.marketSelectionOpened = s);

  marketSymbol = DEFAULT_MARKET;
  setMarketSymbol = (v: string) => (this.marketSymbol = v);

  private marketPricesUpdater: IntervalUpdater;

  constructor(rootStore: RootStore, initState?: ISerializedMarketStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    const { oracleStore } = rootStore;

    if (initState) {
      const favMarkets = initState.favMarkets?.split(",").filter(Boolean);
      favMarkets && this.setFavMarkets(favMarkets);
    }

    this.initMarkets();

    this.marketPricesUpdater = new IntervalUpdater(this.updateMarketPrices, MARKET_PRICES_UPDATE_INTERVAL);

    reaction(
      () => [this.market, oracleStore.initialized],
      () => {
        this.updateMarketPrices();
      },
      { fireImmediately: true },
    );

    this.marketPricesUpdater.run();
  }

  get market() {
    return this.markets.find((market) => market.symbol === this.marketSymbol);
  }

  get spotMarket(): Undefinable<SpotMarket> {
    if (!this.market) return;

    if (SpotMarket.isInstance(this.market)) {
      return this.market;
    }
  }

  get perpMarket(): Undefinable<PerpMarket> {
    if (!this.market) return;

    if (PerpMarket.isInstance(this.market)) {
      return this.market;
    }
  }

  get initialized() {
    return true;
  }

  selectActiveMarket = (marketId?: string) => {
    const bcNetwork = FuelNetwork.getInstance();

    if (!marketId || marketId === this.marketSymbol) return;

    const selectedMarket = this.markets.find((market) => market.symbol === marketId);
    if (!selectedMarket) return;

    if (SpotMarket.isInstance(selectedMarket)) {
      const spotIndexerInfo = CONFIG.SPOT.INDEXERS[selectedMarket.contractAddress as keyof typeof CONFIG.SPOT.INDEXERS];
      bcNetwork.setSpotActiveMarket(selectedMarket.contractAddress, spotIndexerInfo);
    } else if (PerpMarket.isInstance(selectedMarket)) {
      const perpIndexerInfo = CONFIG.PERP.INDEXERS[selectedMarket.contractAddress as keyof typeof CONFIG.PERP.INDEXERS];
      bcNetwork.setPerpActiveMarket(perpIndexerInfo);
    } else {
      throw new Error("Market type not supported");
    }

    this.setMarketSymbol(marketId);
  };

  toggleFavMarket = (marketId: string) => {
    const isFav = this.favMarkets.includes(marketId);

    if (isFav) {
      this.setFavMarkets(this.favMarkets.filter((id) => id !== marketId));
    } else {
      this.setFavMarkets([...this.favMarkets, marketId]);
    }
  };

  updateMarketPrices = async () => {
    const { oracleStore } = this.rootStore;

    this.markets.forEach((market) => {
      let price = BN.ZERO;

      if (SpotMarket.isInstance(market)) {
        // TODO: Fix logic for spot
        price = BN.ZERO;
      } else if (PerpMarket.isInstance(market)) {
        price = market.baseToken.priceFeed
          ? new BN(oracleStore.getTokenIndexPrice(market.baseToken.priceFeed))
          : BN.ZERO;
      }

      market.setPrice(price);
    });
  };

  addToFav = (marketId: string) => {
    if (!this.favMarkets.includes(marketId)) {
      this.setFavMarkets([...this.favMarkets, marketId]);
    }
  };

  removeFromFav = (marketId: string) => {
    const index = this.favMarkets.indexOf(marketId);
    index !== -1 && this.favMarkets.splice(index, 1);
  };

  private initMarkets = async () => {
    try {
      const spotMarkets = CONFIG.SPOT.MARKETS.map(
        (market) =>
          new SpotMarket({
            baseTokenAddress: market.baseAssetId,
            quoteTokenAddress: market.quoteAssetId,
            contractAddress: market.contractId,
          }),
      );

      const perpMarkets = CONFIG.PERP.MARKETS.map(
        (market) =>
          new PerpMarket({
            baseTokenAddress: market.baseAssetId,
            quoteTokenAddress: market.quoteAssetId,
            contractAddress: market.contractId,
            imRatio: BN.ZERO,
            mmRatio: BN.ZERO,
            status: "Opened",
          }),
      );

      const allMarkets = [...spotMarkets, ...perpMarkets];

      const market = allMarkets[0];

      this.setMarkets(allMarkets);
      this.selectActiveMarket(market.symbol);
    } catch (error) {
      console.error("Error init spot market", error);
    }
  };

  serialize = (): ISerializedMarketStore => ({
    favMarkets: this.favMarkets.join(","),
  });
}
