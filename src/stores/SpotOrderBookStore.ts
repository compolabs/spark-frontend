import { HistogramData } from "lightweight-charts";
import { makeAutoObservable, reaction } from "mobx";
import { Nullable } from "tsdef";

import { GetActiveOrdersParams, OrderType } from "@compolabs/spark-orderbook-ts-sdk";
import { GetOrdersParams } from "@compolabs/spark-orderbook-ts-sdk";

import { RootStore } from "@stores";

import { SPOT_ORDER_FILTER } from "@screens/SpotScreen/OrderbookAndTradesInterface/SpotOrderBook/SpotOrderBook";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";
import { formatSpotMarketOrders } from "@utils/formatSpotMarketOrders";
import { CONFIG, Market } from "@utils/getConfig.ts";
import { getOhlcvData, OhlcvData } from "@utils/getOhlcvData";
import { groupOrders } from "@utils/groupOrders";

import { FuelNetwork } from "@blockchain";
import { SpotMarketOrder, SpotMarketTrade } from "@entity";

import { Subscription } from "@src/typings/utils";

type ExchangeRates = {
  [pair: string]: string;
};

class SpotOrderBookStore {
  private readonly rootStore: RootStore;
  private subscriptionToTradeOrderEvents: Nullable<Subscription> = null;

  trades: SpotMarketTrade[] = [];
  isInitialLoadComplete = false;

  allBuyOrders: SpotMarketOrder[] = [];
  allSellOrders: SpotMarketOrder[] = [];

  decimalGroup = 4;
  orderFilter: SPOT_ORDER_FILTER = SPOT_ORDER_FILTER.SELL_AND_BUY;

  isOrderBookLoading = true;

  private buySubscription: Nullable<Subscription> = null;
  private sellSubscription: Nullable<Subscription> = null;

  ohlcvData: OhlcvData[] = [];
  historgramData: HistogramData[] = [];
  marketPrices: ExchangeRates = {};

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    setInterval(() => {
      this.makeOrderPrices();
    }, 5000);

    reaction(
      () => [rootStore.initialized, rootStore.tradeStore.market],
      ([initialized]) => {
        if (!initialized) return;
        this.decimalGroup = this.rootStore.tradeStore.market?.baseToken.precision ?? 4;
        this.updateOrderBook();
        this.makeOrderPrices();
      },
      { fireImmediately: true },
    );

    reaction(
      () => [this.rootStore.tradeStore.market, this.rootStore.initialized],
      ([market, initialized]) => {
        if (!initialized || !market) return;
        this.decimalGroup = this.rootStore.tradeStore.market?.baseToken.precision ?? 4;
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

  private makeOrderPrices() {
    const bcNetwork = FuelNetwork.getInstance();
    CONFIG.MARKETS.forEach(async (el: Market) => {
      const lastTrade = await this.fetchOrderBook(el);
      const precision = bcNetwork.getTokenByAssetId(el.baseAssetId)?.precision ?? 2;
      const nonFormated =
        lastTrade?.data?.TradeOrderEvent.length > 0 ? lastTrade?.data?.TradeOrderEvent[0].tradePrice : 0;
      const formatPrice = BN.formatUnits(nonFormated, DEFAULT_DECIMALS).toFormat(precision);
      this.marketPrices = { ...this.marketPrices, [el.contractId]: formatPrice };
    });
  }

  private async fetchOrderBook(market: Market) {
    const bcNetwork = FuelNetwork.getInstance();
    // TODO: Когда спред будет нормальный, попросят этот расчет маркетного ордера (best ask + best bid) / 2
    //   const params: GetActiveOrdersParams = {
    //     limit: 1,
    //     market: [market.contractId],
    //     asset: market.baseAssetId ?? "",
    //     orderType: orderType,
    //   };
    //   const activeOrders = await bcNetwork.fetchSpotActiveOrders(params);
    //   if ("ActiveSellOrder" in activeOrders.data) {
    //     return new SpotMarketOrder({
    //       ...activeOrders.data.ActiveSellOrder[0],
    //       quoteAssetId: market.quoteAssetId,
    //     });
    //   } else {
    //     return new SpotMarketOrder({
    //       ...activeOrders.data.ActiveBuyOrder[0],
    //       quoteAssetId: market.quoteAssetId,
    //     });
    //   }
    const params: GetOrdersParams = {
      limit: 1,
      market: [market.contractId],
    };
    return await bcNetwork.fetchLastTrade(params);
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

        const orderWithoutBadOrder = orders.filter(
          (o) =>
            o.id.toLowerCase() !== "0xb140a6bf39601d69d0fedacb61ecce95cb65eaa05856583cb1a9af926acbd5bd".toLowerCase(),
        );

        updateOrders(orderWithoutBadOrder);
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
    return BN.formatUnits(this.spread, DEFAULT_DECIMALS).toSignificant(4);
  }

  get spreadPercent(): string {
    return BN.ratioOf(this.spread, this.getMaxBuyPrice).toFormat(2);
  }

  get marketPrice(): string {
    const { tradeStore } = this.rootStore;
    return this.marketPrices[tradeStore.market?.contractAddress ?? ""];
  }

  marketPriceByContractId(contractAddress: string): string {
    return this.marketPrices[contractAddress];
  }

  subscribeTrades = () => {
    const { tradeStore } = this.rootStore;
    const market = tradeStore.market;

    const bcNetwork = FuelNetwork.getInstance();

    if (this.subscriptionToTradeOrderEvents) {
      this.subscriptionToTradeOrderEvents.unsubscribe();
    }
    try {
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
    } catch (err) {
      console.log("err", err);
    }
  };

  get isTradesLoading() {
    return !this.isInitialLoadComplete;
  }
}

export default SpotOrderBookStore;
