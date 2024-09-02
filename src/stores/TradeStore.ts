import { makeAutoObservable, reaction } from "mobx";
import { Nullable } from "tsdef";

import { FuelNetwork } from "@src/blockchain";
import { SpotMarketVolume } from "@src/blockchain/types";
import { DEFAULT_DECIMALS, DEFAULT_MARKET } from "@src/constants";
import { PerpMarket, SpotMarket } from "@src/entity";
import BN from "@src/utils/BN";
import { CONFIG } from "@src/utils/getConfig";
import { IntervalUpdater } from "@src/utils/IntervalUpdater";
import RootStore from "@stores/RootStore";

export interface ISerializedTradeStore {
  favMarkets: Nullable<string>;
}

const MARKET_INFO_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 min
const MARKET_PRICES_UPDATE_INTERVAL = 5 * 1000; // 5 sec

class TradeStore {
  private readonly rootStore: RootStore;

  initialized = false;
  loading = false;
  favMarkets: string[] = [];
  spotMarkets: SpotMarket[] = [];
  marketSelectionOpened = false;
  marketSymbol = DEFAULT_MARKET;

  spotMarketInfo: SpotMarketVolume = {
    volume: BN.ZERO,
    high: BN.ZERO,
    low: BN.ZERO,
  };

  private marketInfoUpdater: IntervalUpdater;
  private marketPricesUpdater: IntervalUpdater;

  constructor(rootStore: RootStore, initState?: ISerializedTradeStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    const { oracleStore } = rootStore;

    if (initState) {
      const favMarkets = initState.favMarkets?.split(",").filter(Boolean);
      favMarkets && this.setFavMarkets(favMarkets);
    }

    this.initMarket();

    this.marketInfoUpdater = new IntervalUpdater(this.updateMarketInfo, MARKET_INFO_UPDATE_INTERVAL);
    this.marketPricesUpdater = new IntervalUpdater(this.updateMarketPrices, MARKET_PRICES_UPDATE_INTERVAL);

    reaction(
      () => [this.market, oracleStore.initialized],
      () => {
        this.updateMarketInfo();
        this.updateMarketPrices();
      },
      { fireImmediately: true },
    );

    this.marketInfoUpdater.run(true);
    this.marketPricesUpdater.run();
  }

  get market() {
    return this.spotMarkets.find((market) => market.symbol === this.marketSymbol);
  }

  setMarketSymbol = (v: string) => (this.marketSymbol = v);

  selectActiveMarket = (marketId?: string) => {
    const bcNetwork = FuelNetwork.getInstance();

    console.log(marketId, this.marketSymbol);

    if (!marketId || marketId === this.marketSymbol) return;

    const getMarket = <T extends SpotMarket | PerpMarket>(markets: T[]) =>
      markets.find((market) => market.symbol === marketId);

    const spotMarket = getMarket<SpotMarket>(this.spotMarkets);

    if (!spotMarket) return;

    const indexerInfo = CONFIG.APP.indexers[spotMarket.contractAddress as keyof typeof CONFIG.APP.indexers];
    bcNetwork.setActiveMarket(spotMarket.contractAddress, indexerInfo);

    this.setMarketSymbol(marketId!);
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

  setMarketSelectionOpened = (s: boolean) => (this.marketSelectionOpened = s);

  updateMarketInfo = async () => {
    const { oracleStore } = this.rootStore;

    if (!this.market) return;

    const info = await FuelNetwork.getInstance().fetchSpotVolume();
    const baseTokenAmount = BN.formatUnits(info.volume, this.market.baseToken.decimals);
    const price = BN.formatUnits(oracleStore.getTokenIndexPrice(this.market.baseToken.priceFeed), DEFAULT_DECIMALS);
    const volume = baseTokenAmount.multipliedBy(price);
    const low = BN.formatUnits(info.low, DEFAULT_DECIMALS);
    const high = BN.formatUnits(info.high, DEFAULT_DECIMALS);

    this.spotMarketInfo = {
      volume,
      low,
      high,
    };
  };

  updateMarketPrices = async () => {
    const { oracleStore } = this.rootStore;

    this.spotMarkets.forEach((market) => {
      const indexPriceBn = market.baseToken.priceFeed
        ? new BN(oracleStore.getTokenIndexPrice(market.baseToken.priceFeed))
        : BN.ZERO;

      market.setPrice(indexPriceBn);
    });
  };

  serialize = (): ISerializedTradeStore => ({
    favMarkets: this.favMarkets.join(","),
  });

  private initMarket = async () => {
    this.setInitialized(false);
    this._setLoading(true);

    await Promise.all([this.initSpotMarket()]).catch(console.error);

    this._setLoading(false);
    this.setInitialized(true);
  };

  private initSpotMarket = async () => {
    const bcNetwork = FuelNetwork.getInstance();

    try {
      const markets = CONFIG.APP.markets.map(
        (market) => new SpotMarket(market.baseAssetId, market.quoteAssetId, market.contractId),
      );

      const market = markets[0];
      const indexerInfo = CONFIG.APP.indexers[market.contractAddress as keyof typeof CONFIG.APP.indexers];
      bcNetwork.setActiveMarket(market.contractAddress, indexerInfo);
      this.setMarketSymbol(market.symbol);

      this.setSpotMarkets(markets);
      await this.updateMarketPrices();
    } catch (error) {
      console.error("Error init spot market", error);
    }
  };

  private setFavMarkets = (v: string[]) => (this.favMarkets = v);

  private setSpotMarkets = (v: SpotMarket[]) => (this.spotMarkets = v);

  private setInitialized = (l: boolean) => (this.initialized = l);

  private _setLoading = (l: boolean) => (this.loading = l);
}

export default TradeStore;
