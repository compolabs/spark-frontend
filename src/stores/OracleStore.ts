import { HermesClient } from "@pythnetwork/hermes-client";
import { makeAutoObservable } from "mobx";

import { Blockchain } from "@blockchain";
import { BN } from "@blockchain/fuel/types";

import RootStore from "@stores/RootStore";

import { IntervalUpdater } from "@utils/IntervalUpdater";

const PYTH_URL = "https://hermes.pyth.network";

const zeroFeedId = "0x0000000000000000000000000000000000000000000000000000000000000000";

const UPDATE_INTERVAL = 15_000;

class OracleStore {
  private readonly rootStore: RootStore;

  priceServiceConnection: HermesClient;
  prices: Record<string, string> = {};
  initialized: boolean = false;

  private priceUpdater: IntervalUpdater;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    this.priceServiceConnection = new HermesClient(PYTH_URL, {});

    this.initAndGetPythPrices().then(() => this.setInitialized(true));

    this.priceUpdater = new IntervalUpdater(this.initAndGetPythPrices, UPDATE_INTERVAL);
  }

  get tokenIndexPrice(): BN {
    const { market } = this.rootStore.tradeStore;
    const token = market?.baseToken;

    if (!token) return BN.ZERO;

    return this.getTokenIndexPrice(token?.priceFeed);
  }

  private initAndGetPythPrices = async () => {
    // You can find the ids of prices at https://pyth.network/developers/price-feed-ids

    const bcNetwork = Blockchain.getInstance();

    const priceIds = bcNetwork.sdk
      .getTokenList()
      .filter((t) => t.priceFeed.toLowerCase() !== zeroFeedId.toLowerCase())
      .map((t) => t.priceFeed);

    const response = await this.priceServiceConnection.getLatestPriceUpdates(priceIds, { parsed: true });

    const lastPriceUpdates = response.parsed ?? [];

    const initPrices = lastPriceUpdates.reduce(
      (acc, priceFeed) => {
        return { ...acc, [`0x${priceFeed.id}`]: priceFeed.price.price };
      },
      {} as Record<string, string>,
    );

    this.setPrices(initPrices);
  };

  getTokenIndexPrice = (priceFeed: string): BN => {
    if (!this.prices) return BN.ZERO;

    const price = this.prices[priceFeed];

    if (!price) return BN.ZERO;

    const priceBN = new BN(price);

    // Нам нужно докидывать 1 decimal, потому что decimals разный в api и у нас
    return BN.parseUnits(priceBN, 1);
  };

  private setPrices = (v: Record<string, string>) => (this.prices = v);

  private setInitialized = (l: boolean) => (this.initialized = l);
}

export default OracleStore;
