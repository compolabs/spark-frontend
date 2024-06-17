import { makeAutoObservable, reaction } from "mobx";

import { FuelNetwork } from "@src/blockchain";
import { PerpMarketVolume, SpotMarketVolume } from "@src/blockchain/types";
import { DEFAULT_DECIMALS } from "@src/constants";
import { PerpMarket, SpotMarket } from "@src/entity";
import BN from "@src/utils/BN";
import { IntervalUpdater } from "@src/utils/IntervalUpdater";
import RootStore from "@stores/RootStore";

export interface ISerializedTradeStore {
  favMarkets: string | null;
}

const MARKET_INFO_UPDATE_INTERVAL = 1 * 60 * 1000; // 1 min
const MARKET_PRICES_UPDATE_INTERVAL = 10 * 1000; // 10 sec

class TradeStore {
  rootStore: RootStore;
  initialized: boolean = false;
  loading: boolean = false;
  favMarkets: string[] = [];
  spotMarkets: SpotMarket[] = [];
  perpMarkets: PerpMarket[] = [];
  marketSelectionOpened: boolean = false;
  marketSymbol: string | null = null;
  readonly defaultMarketSymbol = "BTC-USDC";

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

    if (initState) {
      const favMarkets = initState.favMarkets?.split(",").filter(Boolean);
      favMarkets && this.setFavMarkets(favMarkets);
    }

    this.initMarket();

    this.marketInfoUpdater = new IntervalUpdater(this.updateMarketInfo, MARKET_INFO_UPDATE_INTERVAL);
    this.marketPricesUpdater = new IntervalUpdater(this.updateMarketPrices, MARKET_PRICES_UPDATE_INTERVAL);

    reaction(
      () => this.market,
      () => {
        this.updateMarketInfo();
      },
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
    const volume = BN.parseUnits(baseTokenAmount.multipliedBy(price), this.market.quoteToken.decimals);

    this.spotMarketInfo = {
      ...info,
      volume,
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
    const bcNetwork = FuelNetwork.getInstance();

    const spotMarketPriceUpdates = this.spotMarkets.map((market) =>
      bcNetwork!.fetchSpotMarketPrice(market.baseToken.assetId),
    );

    await Promise.all(spotMarketPriceUpdates);
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
      const markets = await bcNetwork!.fetchSpotMarkets(100);
      const spotMarkets = markets
        .filter((market) => bcNetwork!.getTokenByAssetId(market.assetId) !== undefined)
        .map((market) => new SpotMarket(market.assetId, bcNetwork!.getTokenBySymbol("USDC").assetId));

      this.setSpotMarkets(spotMarkets);
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
