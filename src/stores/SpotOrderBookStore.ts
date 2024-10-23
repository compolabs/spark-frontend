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

  private _sortOrders(orders: SpotMarketOrder[]): SpotMarketOrder[] {
    return orders.sort((a, b) => {
      if (a.price === null && b.price === null) return 0;
      if (a.price === null && b.price !== null) return 1;
      if (a.price !== null && b.price === null) return -1;
      return a.price.lt(b.price) ? 1 : -1;
    });
  }

  private _getOrders(orders: SpotMarketOrder[], reverse = false): SpotMarketOrder[] {
    const sortedOrders = this._sortOrders(orders.slice());

    return reverse ? sortedOrders.reverse() : sortedOrders;
  }

  get buyOrders(): SpotMarketOrder[] {
    return this._getOrders(this.allBuyOrders, true);
  }

  get sellOrders(): SpotMarketOrder[] {
    return this._getOrders(this.allSellOrders);
  }

  get totalBuy(): BN {
    return this.buyOrders.reduce((acc, order) => acc.plus(order.initialQuoteAmount), BN.ZERO);
  }

  get totalSell(): BN {
    return this.sellOrders.reduce((acc, order) => acc.plus(order.initialAmount), BN.ZERO);
  }

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

  private get getMaxBuyPrice(): BN {
    return this.getPrice(this.allBuyOrders, "max");
  }

  private get getMinSellPrice(): BN {
    return this.getPrice(this.allSellOrders, "min");
  }

  get spread(): BN {
    return this.getMinSellPrice.minus(this.getMaxBuyPrice);
  }

  get isSpreadValid(): boolean {
    if (this.getMinSellPrice.isZero() || this.getMaxBuyPrice.isZero()) {
      return false;
    }

    return true;
  }

  get spreadPrice(): string {
    return BN.formatUnits(this.spread, DEFAULT_DECIMALS).toSignificant(2);
  }

  get spreadPercent(): string {
    return BN.ratioOf(this.spread, this.getMaxBuyPrice).toFormat(2);
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
        market: [market!.contractAddress],
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
