import { toBech32 } from "fuels";
import _ from "lodash";
import { makeAutoObservable, reaction } from "mobx";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";
import { IntervalUpdater } from "@utils/IntervalUpdater";

import { FuelNetwork } from "@blockchain";
import { SpotMarketVolume } from "@blockchain/types";

import RootStore from "./RootStore";

const MARKET_INFO_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 min

export class SpotMarketInfoStore {
  private readonly rootStore: RootStore;

  marketInfo: SpotMarketVolume = {
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

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    const { oracleStore, marketStore } = rootStore;

    this.marketInfoUpdater = new IntervalUpdater(this.updateMarketInfo, MARKET_INFO_UPDATE_INTERVAL);

    reaction(
      () => [marketStore.market, oracleStore.initialized],
      () => {
        this.updateMarketInfo();
        this.fetchMatcherFee();
        this.getMinimalOrder();
      },
      { fireImmediately: true },
    );

    this.marketInfoUpdater.run(true);
  }

  get isFeeLoading(): boolean {
    return this.isTradeFeeLoading || this.isMatcherFeeLoading;
  }

  get exchangeFee(): BN {
    const { makerFee, takerFee } = this.tradeFee;

    return BN.max(makerFee, takerFee);
  }

  get exchangeFeeFormat(): BN {
    const { marketStore } = this.rootStore;
    if (!marketStore.spotMarket) return BN.ZERO;

    const decimals = marketStore.spotMarket.quoteToken.decimals;
    return BN.formatUnits(this.exchangeFee, decimals);
  }

  get matcherFeeFormat(): BN {
    const { marketStore } = this.rootStore;
    if (!marketStore.spotMarket) return BN.ZERO;

    const decimals = marketStore.spotMarket.quoteToken.decimals;
    return BN.formatUnits(this.matcherFee, decimals);
  }

  getIsEnoughtMoneyForFee(isSell: boolean) {
    const { marketStore } = this.rootStore;

    if (!marketStore.spotMarket || isSell) return true;
    const { balanceStore } = this.rootStore;

    const walletAmount = balanceStore.getWalletBalance(marketStore.spotMarket.quoteToken.assetId);

    return this.exchangeFee.plus(this.matcherFee).lte(walletAmount);
  }

  getMinimalOrder = async () => {
    const bcNetwork = FuelNetwork.getInstance();
    const [order, price] = await Promise.all([bcNetwork.spotFetchMinOrderSize(), bcNetwork.spotFetchMinOrderPrice()]);
    this.minimalOrder = {
      minPrice: new BN(price),
      minOrder: new BN(order),
    };
  };

  updateMarketInfo = async () => {
    const { marketStore } = this.rootStore;
    if (!marketStore.spotMarket) return;

    const info = await FuelNetwork.getInstance().spotFetchVolume({
      limit: 1000,
      market: [marketStore.spotMarket.contractAddress],
    });

    const volume = BN.formatUnits(info.volume, marketStore.spotMarket.baseToken.decimals);
    const low = BN.formatUnits(info.low, DEFAULT_DECIMALS);
    const high = BN.formatUnits(info.high, DEFAULT_DECIMALS);

    this.marketInfo = {
      volume,
      low,
      high,
    };
  };

  fetchMatcherFee = async () => {
    const { marketStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!marketStore.spotMarket) return;

    this.isMatcherFeeLoading = true;
    const matcherFee = await bcNetwork.spotFetchMatcherFee();

    this.matcherFee = new BN(matcherFee);
    this.isMatcherFeeLoading = false;
  };

  private fetchTradeFee = async (quoteAmount: string) => {
    const { accountStore, marketStore } = this.rootStore;

    if (new BN(quoteAmount).isZero()) {
      this.tradeFee = { makerFee: BN.ZERO, takerFee: BN.ZERO };
      return;
    }

    const bcNetwork = FuelNetwork.getInstance();

    if (!accountStore.address || !marketStore.spotMarket) return;

    this.isTradeFeeLoading = true;
    const address = toBech32(accountStore.address!);

    const { makerFee, takerFee } = await bcNetwork.spotFetchProtocolFeeAmountForUser(quoteAmount, address);

    this.tradeFee = { makerFee: new BN(makerFee), takerFee: new BN(takerFee) };
    this.isTradeFeeLoading = false;
  };

  fetchTradeFeeDebounce = _.debounce(this.fetchTradeFee, 250);
}
