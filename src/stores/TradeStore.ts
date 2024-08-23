import { makeAutoObservable, reaction } from "mobx";
import { Nullable } from "tsdef";

import { FuelNetwork } from "@src/blockchain";
import { PerpMarketVolume, SpotMarketVolume } from "@src/blockchain/types";
import { DEFAULT_DECIMALS } from "@src/constants";
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
  perpMarkets: PerpMarket[] = [];
  marketSelectionOpened = false;
  marketSymbol: string = "BTC-USDC";

  isPerp = false;
  setIsPerp = (value: boolean) => (this.isPerp = value);

  spotMarketInfo: SpotMarketVolume = {
    volume: BN.ZERO,
    high: BN.ZERO,
    low: BN.ZERO,
  };

  perpMarketInfo: PerpMarketVolume = {
    predictedFundingRate: BN.ZERO,
    averageFunding24h: BN.ZERO,
    openInterest: BN.ZERO,
    volume24h: BN.ZERO,
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
    if (this.isPerp) {
      return this.perpMarkets.find((market) => market.symbol === this.marketSymbol);
    }
    return this.spotMarkets.find((market) => market.symbol === this.marketSymbol);
  }

  get isPerpAvailable() {
    return false;
  }

  setMarketSymbol = (v: string) => (this.marketSymbol = v);

  selectActiveMarket = (isPerp: boolean, marketId?: string) => {
    const bcNetwork = FuelNetwork.getInstance();

    const getMarket = <T extends SpotMarket | PerpMarket>(markets: T[]) =>
      markets.find((market) => market.symbol === marketId);

    const spotMarket = getMarket<SpotMarket>(this.spotMarkets);
    const perpMarket = getMarket<PerpMarket>(this.perpMarkets);

    if (spotMarket || perpMarket) {
      this.setMarketSymbol(marketId!);
    }

    if (spotMarket) {
      bcNetwork.setActiveMarket(spotMarket.contractAddress);
    } else if (perpMarket) {
      bcNetwork.setActiveMarket(perpMarket.contractAddress);
    }

    this.setIsPerp(isPerp && this.isPerpAvailable);
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

    // fixme
    // if (!this.market || this.market instanceof PerpMarket) return;
    //
    // const predictedFundingRate = await bcNetwork!.fetchPerpFundingRate(this.market.baseToken.assetId);
    //
    // this.perpMarketInfo = {
    //   ...this.perpMarketInfo,
    //   predictedFundingRate: BN.formatUnits(predictedFundingRate, this.market.quoteToken.decimals),
    // };
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

    await Promise.all([this.initSpotMarket(), this.initPerpMarket()]).catch(console.error);

    this._setLoading(false);
    this.setInitialized(true);
  };

  private initSpotMarket = async () => {
    const bcNetwork = FuelNetwork.getInstance();

    try {
      const markets = CONFIG.APP.markets.map(
        (market) => new SpotMarket(market.baseAssetId, market.quoteAssetId, market.contractId),
      );

      bcNetwork.setActiveMarket(markets[0].contractAddress);

      this.setSpotMarkets(markets);
      await this.updateMarketPrices();
    } catch (error) {
      console.error("Error init spot market", error);
    }
  };

  private initPerpMarket = async () => {
    const bcNetwork = FuelNetwork.getInstance();

    try {
      const markets = await bcNetwork!.fetchPerpAllMarkets();
      this.setPerpMarkets(markets);
    } catch (error) {
      console.error("[PERP] Error init perp market", error);
    }
  };

  private setFavMarkets = (v: string[]) => (this.favMarkets = v);

  private setSpotMarkets = (v: SpotMarket[]) => (this.spotMarkets = v);

  private setPerpMarkets = (v: PerpMarket[]) => (this.perpMarkets = v);

  private setInitialized = (l: boolean) => (this.initialized = l);

  private _setLoading = (l: boolean) => (this.loading = l);
}

export default TradeStore;
