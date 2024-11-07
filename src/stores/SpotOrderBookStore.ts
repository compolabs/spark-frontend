import { HistogramData } from "lightweight-charts";
import { makeAutoObservable, reaction } from "mobx";
import { Nullable } from "tsdef";

import { GetActiveOrdersParams, OrderType } from "@compolabs/spark-orderbook-ts-sdk";

import { RootStore } from "@stores";

import { SPOT_ORDER_FILTER } from "@screens/SpotScreen/OrderbookAndTradesInterface/SpotOrderBook/SpotOrderBook";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";
import { formatSpotMarketOrders } from "@utils/formatSpotMarketOrders";
import { getOhlcvData, OhlcvData } from "@utils/getOhlcvData";
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

  isOrderBookLoading = true;

  private buySubscription: Nullable<Subscription> = null;
  private sellSubscription: Nullable<Subscription> = null;

  ohlcvData: OhlcvData[] = [];
  historgramData: HistogramData[] = [];

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

  private _sortOrders(orders: SpotMarketOrder[], reverse: boolean): SpotMarketOrder[] {
    return orders.sort((a, b) => {
      if (reverse) {
        return a.price.lt(b.price) ? -1 : 1;
      } else {
        return a.price.lt(b.price) ? 1 : -1;
      }
    });
  }

  private _getOrders(orders: SpotMarketOrder[], reverse = false): SpotMarketOrder[] {
    const groupedOrders = groupOrders(orders, this.decimalGroup);
    return this._sortOrders(groupedOrders.slice(), reverse);
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

  get lastTradePrice(): BN {
    if (!this.trades.length) {
      return BN.ZERO;
    }

    return new BN(this.trades[0].tradePrice);
  }

  setDecimalGroup = (value: number) => {
    this.decimalGroup = value;
  };

  setOrderFilter = (value: SPOT_ORDER_FILTER) => (this.orderFilter = value);

  updateOrderBook = () => {
    const { tradeStore } = this.rootStore;
    const market = tradeStore.market;

    if (!this.rootStore.initialized || !market) return;

    const bcNetwork = FuelNetwork.getInstance();

    const params: Omit<GetActiveOrdersParams, "orderType"> = {
      limit: 150,
      market: [market.contractAddress],
      asset: market.baseToken.assetId,
    };

    this.subscribeToBuyOrders(bcNetwork, params);
    this.subscribeToSellOrders(bcNetwork, params);
  };

  private subscribeToOrders(
    orderType: OrderType,
    subscription: Subscription | null,
    updateOrders: (orders: SpotMarketOrder[]) => void,
    bcNetwork: FuelNetwork,
    params: Omit<GetActiveOrdersParams, "orderType">,
  ) {
    if (subscription) {
      subscription.unsubscribe();
    }

    const { tradeStore } = this.rootStore;
    const market = tradeStore.market;

    const newSubscription = bcNetwork.subscribeSpotActiveOrders({ ...params, orderType }).subscribe({
      next: ({ data }) => {
        this.isOrderBookLoading = false;
        if (!data) return;

        const orders = formatSpotMarketOrders(
          "ActiveBuyOrder" in data ? data.ActiveBuyOrder : data.ActiveSellOrder,
          market!.quoteToken.assetId,
        );
        updateOrders(orders);
      },
    });

    if (orderType === OrderType.Buy) {
      this.buySubscription = newSubscription;
    } else {
      this.sellSubscription = newSubscription;
    }
  }

  private subscribeToBuyOrders(bcNetwork: FuelNetwork, params: Omit<GetActiveOrdersParams, "orderType">) {
    this.subscribeToOrders(
      OrderType.Buy,
      this.buySubscription,
      (orders) => (this.allBuyOrders = orders),
      bcNetwork,
      params,
    );
  }

  private subscribeToSellOrders(bcNetwork: FuelNetwork, params: Omit<GetActiveOrdersParams, "orderType">) {
    this.subscribeToOrders(
      OrderType.Sell,
      this.sellSubscription,
      (orders) => (this.allSellOrders = orders),
      bcNetwork,
      params,
    );
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
        limit: 500,
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

          const ohlcvData = getOhlcvData(data.TradeOrderEvent, "1m");
          this.ohlcvData = ohlcvData.ohlcvData;
          this.historgramData = ohlcvData.historgramData;

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
