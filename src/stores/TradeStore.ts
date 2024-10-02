import { toBech32 } from "fuels";
import { makeAutoObservable, reaction } from "mobx";
import { Nullable } from "tsdef";

import RootStore from "@stores/RootStore";

import { DEFAULT_DECIMALS, DEFAULT_MARKET } from "@constants";
import BN from "@utils/BN";
import { CONFIG } from "@utils/getConfig";
import { IntervalUpdater } from "@utils/IntervalUpdater";

import { FuelNetwork } from "@blockchain";
import { SpotMarketVolume } from "@blockchain/types";
import { PerpMarket, SpotMarket } from "@entity";

export interface ISerializedTradeStore {
  favMarkets: Nullable<string>;
}

const MARKET_INFO_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 min
const MARKET_PRICES_UPDATE_INTERVAL = 5 * 1000; // 5 sec

class TradeStore {
  private readonly rootStore: RootStore;

  favMarkets: string[] = [];
  spotMarkets: SpotMarket[] = [];
  marketSelectionOpened = false;
  marketSymbol = DEFAULT_MARKET;

  spotMarketInfo: SpotMarketVolume = {
    volume: BN.ZERO,
    high: BN.ZERO,
    low: BN.ZERO,
  };

  matcherFee = BN.ZERO;
  tradeFee = {
    makerFee: BN.ZERO,
    takerFee: BN.ZERO,
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
        this.fetchMatcherFee();
      },
      { fireImmediately: true },
    );

    this.marketInfoUpdater.run(true);
    this.marketPricesUpdater.run();
  }

  get market() {
    return this.spotMarkets.find((market) => market.symbol === this.marketSymbol);
  }

  get initialized() {
    const isMarketInfoReady = !(
      this.spotMarketInfo.high.isZero() ||
      this.spotMarketInfo.low.isZero() ||
      this.spotMarketInfo.volume.isZero()
    );
    return Boolean(this.spotMarkets.length && isMarketInfoReady);
  }

  setMarketSymbol = (v: string) => (this.marketSymbol = v);

  selectActiveMarket = (marketId?: string) => {
    const bcNetwork = FuelNetwork.getInstance();

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

    const info = await FuelNetwork.getInstance().fetchSpotVolume({
      limit: 1000,
      market: this.market.contractAddress,
    });
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

  fetchMatcherFee = async () => {
    const bcNetwork = FuelNetwork.getInstance();

    if (!this.market) return;

    const matcherFee = await bcNetwork.fetchSpotMatcherFee();
    const decimals = this.market.quoteToken.decimals;

    this.matcherFee = BN.formatUnits(matcherFee, decimals);
  };

  fetchTradeFee = async (quoteAmount: string) => {
    const { accountStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!accountStore.address || !this.market) return;

    const address = toBech32(accountStore.address!);

    const tradeFee = await bcNetwork.fetchSpotProtocolFeeAmountForUser(quoteAmount, address);

    const decimals = this.market.quoteToken.decimals;

    this.tradeFee = {
      makerFee: BN.formatUnits(tradeFee.makerFee, decimals),
      takerFee: BN.formatUnits(tradeFee.takerFee, decimals),
    };
  };

  serialize = (): ISerializedTradeStore => ({
    favMarkets: this.favMarkets.join(","),
  });

  private initMarket = async () => {
    await this.initSpotMarket().catch(console.error);
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
}

export default TradeStore;
