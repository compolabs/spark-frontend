import { toBech32 } from "fuels";
import _ from "lodash";
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

  minimalOrder = {
    minPrice: BN.ZERO,
    minOrder: BN.ZERO,
  };

  isTradeFeeLoading = false;
  isMatcherFeeLoading = false;

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
        this.getMinimalOrder();
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
    // const isMarketInfoReady = !(
    //   this.spotMarketInfo.high.isZero() ||
    //   this.spotMarketInfo.low.isZero() ||
    //   this.spotMarketInfo.volume.isZero()
    // );
    // return Boolean(this.spotMarkets.length && isMarketInfoReady);
    return true;
  }

  get isFeeLoading(): boolean {
    return this.isTradeFeeLoading || this.isMatcherFeeLoading;
  }

  get exchangeFee(): BN {
    const { tradeStore } = this.rootStore;
    const { makerFee, takerFee } = tradeStore.tradeFee;

    return BN.max(makerFee, takerFee);
  }

  get exchangeFeeFormat(): BN {
    if (!this.market) return BN.ZERO;

    const decimals = this.market.quoteToken.decimals;
    return BN.formatUnits(this.exchangeFee, decimals);
  }

  get matcherFeeFormat(): BN {
    if (!this.market) return BN.ZERO;

    const decimals = this.market.quoteToken.decimals;
    return BN.formatUnits(this.matcherFee, decimals);
  }

  get isEnoughtMoneyForFee() {
    if (!this.market) return true;
    const { balanceStore } = this.rootStore;

    const { quoteToken } = this.market;
    const walletAmount = balanceStore.getWalletBalance(quoteToken.assetId);

    return this.exchangeFee.plus(this.matcherFee).lte(walletAmount);
  }

  getMinimalOrder = async () => {
    const bcNetwork = FuelNetwork.getInstance();
    const [order, price] = await Promise.all([bcNetwork.fetchMinOrderSize(), bcNetwork.fetchMinOrderPrice()]);
    this.minimalOrder = {
      minPrice: new BN(price),
      minOrder: new BN(order),
    };
  };

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
    if (!this.market) return;

    const info = await FuelNetwork.getInstance().fetchSpotVolume({
      limit: 1000,
      market: [this.market.contractAddress],
    });

    const volume = BN.formatUnits(info.volume, this.market.baseToken.decimals);
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

    this.isMatcherFeeLoading = true;
    const matcherFee = await bcNetwork.fetchSpotMatcherFee();

    this.matcherFee = new BN(matcherFee);
    this.isMatcherFeeLoading = false;
  };

  private fetchTradeFee = async (quoteAmount: string) => {
    if (new BN(quoteAmount).isZero()) {
      this.tradeFee = { makerFee: BN.ZERO, takerFee: BN.ZERO };
      return;
    }

    const { accountStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!accountStore.address || !this.market) return;

    this.isTradeFeeLoading = true;
    const address = toBech32(accountStore.address!);

    const { makerFee, takerFee } = await bcNetwork.fetchSpotProtocolFeeAmountForUser(quoteAmount, address);

    this.tradeFee = { makerFee: new BN(makerFee), takerFee: new BN(takerFee) };
    this.isTradeFeeLoading = false;
  };

  fetchTradeFeeDebounce = _.debounce(this.fetchTradeFee, 250);

  serialize = (): ISerializedTradeStore => ({
    favMarkets: this.favMarkets.join(","),
  });

  private initMarket = async () => {
    await this.initSpotMarket().catch(console.error);
    await this.getMinimalOrder();
  };

  private initSpotMarket = async () => {
    const bcNetwork = FuelNetwork.getInstance();

    try {
      const markets = CONFIG.MARKETS.map(
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
