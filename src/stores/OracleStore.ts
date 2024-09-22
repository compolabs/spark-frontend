import { EvmPriceServiceConnection, Price, PriceFeed } from "@pythnetwork/pyth-evm-js";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import RootStore from "@stores/RootStore";

import BN from "@utils/BN";

import { FuelNetwork } from "@blockchain";

const PYTH_URL = "https://hermes.pyth.network";

class OracleStore {
  private readonly rootStore: RootStore;

  priceServiceConnection: EvmPriceServiceConnection;
  prices: Nullable<Record<string, Price>> = null;
  initialized: boolean = false;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    this.priceServiceConnection = new EvmPriceServiceConnection(PYTH_URL, {
      logger: {
        error: console.error,
        warn: console.warn,
        info: () => undefined,
        debug: () => undefined,
        trace: () => undefined,
      },
    });

    this.initAndGetPythPrices().then(() => this.setInitialized(true));
  }

  get tokenIndexPrice(): BN {
    const { market } = this.rootStore.tradeStore;
    const token = market?.baseToken;

    if (!token) return BN.ZERO;

    return this.getTokenIndexPrice(token?.priceFeed);
  }

  private initAndGetPythPrices = async () => {
    // You can find the ids of prices at https://pyth.network/developers/price-feed-ids

    const bcNetwork = FuelNetwork.getInstance();

    const priceIds = bcNetwork!
      .getTokenList()
      .filter((t) => t.priceFeed)
      .map((t) => t.priceFeed);

    const res = await this.priceServiceConnection.getLatestPriceFeeds(priceIds);

    const initPrices = res?.reduce((acc, priceFeed) => {
      const price = priceFeed.getPriceUnchecked();
      return { ...acc, [`0x${priceFeed.id}`]: price };
    }, {} as any);
    this.setPrices(initPrices);

    await this.priceServiceConnection.subscribePriceFeedUpdates(priceIds, (priceFeed: PriceFeed) => {
      const price = priceFeed.getPriceUnchecked();
      this.setPrices({ ...this.prices, [`0x${priceFeed.id}`]: price });
    });
  };

  getTokenIndexPrice = (priceFeed: string): BN => {
    if (!this.prices) return BN.ZERO;

    const feed = this.prices[priceFeed];

    if (!feed?.price) return BN.ZERO;

    const price = new BN(feed.price);

    // Нам нужно докидывать 1 decimal, потому что decimals разный в api и у нас
    return BN.parseUnits(price, 1);
  };

  getPriceFeedUpdateData = async (feedIds: string | string[]): Promise<string[]> => {
    return this.priceServiceConnection.getPriceFeedsUpdateData([feedIds].flat());
  };

  private setPrices = (v: Record<string, Price>) => (this.prices = v);

  private setInitialized = (l: boolean) => (this.initialized = l);
}

export default OracleStore;
