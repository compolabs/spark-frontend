import { makeAutoObservable, reaction } from "mobx";
import { Nullable } from "tsdef";

import { GetActiveOrdersParams, OrderType } from "@compolabs/spark-orderbook-ts-sdk";

import { RootStore } from "@stores";

import { SPOT_ORDER_FILTER } from "@screens/SpotScreen/OrderbookAndTradesInterface/SpotOrderBook/SpotOrderBook";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";
import { formatSpotMarketOrders } from "@utils/formatSpotMarketOrders";
import { groupOrders } from "@utils/groupOrders";

import { FuelNetwork } from "@blockchain";
import { SpotMarketOrder, SpotMarketTrade } from "@entity";

import { Subscription } from "@src/typings/utils";

class SpotOrderBookStore {
  private readonly rootStore: RootStore;
  private subscriptionToTradeOrderEvents: Nullable<Subscription> = null;

  trades: SpotMarketTrade[] = [];
  isInitialLoadComplete = false;

  allBuyOrders: SpotMarketOrder[] = [];
  allSellOrders: SpotMarketOrder[] = [];

  decimalGroup = 2;
  orderFilter: SPOT_ORDER_FILTER = SPOT_ORDER_FILTER.SELL_AND_BUY;
  amountOfOrders: number = 0;

  isOrderBookLoading = true;

  private buySubscription: Nullable<Subscription> = null;
  private sellSubscription: Nullable<Subscription> = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    reaction(
      () => [rootStore.initialized, rootStore.tradeStore.market],
      ([initialized]) => {
        if (!initialized) return;

        this.updateOrderBook();
      },
      { fireImmediately: true },
    );

    reaction(
      () => [this.rootStore.tradeStore.market, this.rootStore.initialized],
      ([market, initialized]) => {
        if (!initialized || !market) return;

        this.subscribeTrades();
      },
      { fireImmediately: true },
    );
  }

  get oneSizeOrders() {
    return +new BN(this.amountOfOrders).div(2).toFixed(0) - 1;
  }

  get buyOrders() {
    return this.allBuyOrders
      .slice()
      .sort((a, b) => {
        if (a.price === null && b.price === null) return 0;
        if (a.price === null && b.price !== null) return 1;
        if (a.price === null && b.price === null) return -1;
        return a.price.lt(b.price) ? 1 : -1;
      })
      .reverse()
      .slice(this.orderFilter === SPOT_ORDER_FILTER.SELL_AND_BUY ? -this.oneSizeOrders : -this.amountOfOrders)
      .reverse();
  }

  get sellOrders() {
    return this.allSellOrders
      .slice()
      .sort((a, b) => {
        if (a.price === null && b.price === null) return 0;
        if (a.price === null && b.price !== null) return 1;
        if (a.price === null && b.price === null) return -1;
        return a.price.lt(b.price) ? 1 : -1;
      })
      .slice(this.orderFilter === SPOT_ORDER_FILTER.SELL_AND_BUY ? -this.oneSizeOrders : -this.amountOfOrders);
  }

  get totalBuy() {
    return this.buyOrders.reduce((acc, order) => acc.plus(order.initialQuoteAmount), BN.ZERO);
  }

  get totalSell() {
    return this.sellOrders.reduce((acc, order) => acc.plus(order.initialAmount), BN.ZERO);
  }

  calcSize = (isMobile: boolean) => {
    const orderbookHeight = isMobile ? 420 : window.innerHeight - 210;
    const rowHeight = 19;
    this.setAmountOfOrders(Math.floor((orderbookHeight - 24) / rowHeight));
  };

  setAmountOfOrders = (value: number) => (this.amountOfOrders = value);

  setDecimalGroup = (value: number) => {
    this.decimalGroup = value;

    const buyOrdersCombinedByDecimal = groupOrders(this.allBuyOrders, value);
    const sellOrdersCombinedByDecimal = groupOrders(this.allSellOrders, value);

    this.allBuyOrders = buyOrdersCombinedByDecimal;
    this.allSellOrders = sellOrdersCombinedByDecimal;
  };

  setOrderFilter = (value: SPOT_ORDER_FILTER) => (this.orderFilter = value);

  updateOrderBook = () => {
    const { tradeStore } = this.rootStore;
    const market = tradeStore.market;

    if (!this.rootStore.initialized || !market) return;

    const bcNetwork = FuelNetwork.getInstance();

    const params: Omit<GetActiveOrdersParams, "orderType"> = {
      limit: 100,
      market: [market.contractAddress],
      asset: market.baseToken.assetId,
    };

    this.subscribeToBuyOrders(bcNetwork, params);
    this.subscribeToSellOrders(bcNetwork, params);
  };

  private subscribeToBuyOrders(bcNetwork: FuelNetwork, params: Omit<GetActiveOrdersParams, "orderType">) {
    if (this.buySubscription) {
      this.buySubscription.unsubscribe();
    }

    const { tradeStore } = this.rootStore;
    const market = tradeStore.market;

    this.buySubscription = bcNetwork
      .subscribeSpotActiveOrders<OrderType.Buy>({ ...params, orderType: OrderType.Buy })
      .subscribe({
        next: ({ data }) => {
          this.isOrderBookLoading = false;
          if (!data) return;

          const buyOrders = formatSpotMarketOrders(data.ActiveBuyOrder, market!.quoteToken.assetId);
          const buyOrdersCombinedByDecimal = groupOrders(buyOrders, this.decimalGroup);
          this.allBuyOrders = buyOrdersCombinedByDecimal;
        },
      });
  }

  private subscribeToSellOrders(bcNetwork: FuelNetwork, params: Omit<GetActiveOrdersParams, "orderType">) {
    if (this.sellSubscription) {
      this.sellSubscription.unsubscribe();
    }

    const { tradeStore } = this.rootStore;
    const market = tradeStore.market;

    this.sellSubscription = bcNetwork
      .subscribeSpotActiveOrders<OrderType.Sell>({ ...params, orderType: OrderType.Sell })
      .subscribe({
        next: ({ data }) => {
          this.isOrderBookLoading = false;
          if (!data) return;

          const sellOrders = formatSpotMarketOrders(data.ActiveSellOrder, market!.quoteToken.assetId);
          const sellOrdersCombinedByDecimal = groupOrders(sellOrders, this.decimalGroup);
          this.allSellOrders = sellOrdersCombinedByDecimal;
        },
      });
  }

  private getPrice(orders: SpotMarketOrder[], priceType: "max" | "min"): BN {
    const compareType = priceType === "max" ? "gt" : "lt";
    return orders.reduce(
      (value, order) => (order.price[compareType](value) ? order.price : value),
      orders[0]?.price ?? BN.ZERO,
    );
  }

  private getMaxBuyPrice(): BN {
    return this.getPrice(this.allBuyOrders, "max");
  }

  private getMinSellPrice(): BN {
    return this.getPrice(this.allSellOrders, "min");
  }

  get spreadPrice(): string {
    const maxBuyPrice = this.getMaxBuyPrice();
    const minSellPrice = this.getMinSellPrice();

    const spread = minSellPrice.minus(maxBuyPrice);
    return BN.formatUnits(spread, DEFAULT_DECIMALS).toSignificant(2);
  }

  get spreadPercent(): string {
    const maxBuyPrice = this.getMaxBuyPrice();
    const minSellPrice = this.getMinSellPrice();

    const spread = minSellPrice.minus(maxBuyPrice);
    return spread.div(maxBuyPrice).times(100).toFormat(2);
  }

  subscribeTrades = () => {
    const { tradeStore } = this.rootStore;
    const market = tradeStore.market;

    const bcNetwork = FuelNetwork.getInstance();

    if (this.subscriptionToTradeOrderEvents) {
      this.subscriptionToTradeOrderEvents.unsubscribe();
    }

    this.subscriptionToTradeOrderEvents = bcNetwork
      .subscribeSpotTradeOrderEvents({
        limit: 50,
        market: market!.contractAddress,
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

export default SpotOrderBookStore;
