import React, { useMemo } from "react";
import { GetOrdersParams, OrderType } from "@compolabs/spark-orderbook-ts-sdk";
import { makeAutoObservable, reaction } from "mobx";
import { Nullable } from "tsdef";

import { FuelNetwork } from "@src/blockchain";
import { TOKENS_BY_SYMBOL } from "@src/blockchain/constants";
import { DEFAULT_DECIMALS } from "@src/constants";
import { SpotMarketOrder } from "@src/entity";
import useVM from "@src/hooks/useVM";
import { Subscription } from "@src/typings/utils";
import BN from "@src/utils/BN";
import { formatSpotMarketOrders } from "@src/utils/formatSpotMarketOrders";
import { groupOrders } from "@src/utils/groupOrders";
import { RootStore, useStores } from "@stores";

import { SPOT_ORDER_FILTER } from "./SpotOrderBook";

const ctx = React.createContext<SpotOrderbookVM | null>(null);

interface IProps {
  children: React.ReactNode;
}

export const SpotOrderbookVMProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new SpotOrderbookVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useSpotOrderbookVM = () => useVM(ctx);

type TOrderbookData = {
  buy: SpotMarketOrder[];
  sell: SpotMarketOrder[];
  spreadPercent: string;
  spreadPrice: string;
};

class SpotOrderbookVM {
  private readonly rootStore: RootStore;

  allBuyOrders: SpotMarketOrder[] = [];
  allSellOrders: SpotMarketOrder[] = [];

  orderbook: TOrderbookData = {
    buy: [],
    sell: [],
    spreadPercent: "0.00",
    spreadPrice: "",
  };
  decimalGroup = 2;
  orderFilter: SPOT_ORDER_FILTER = SPOT_ORDER_FILTER.SELL_AND_BUY;
  amountOfOrders: number = 0;

  isOrderBookLoading = false;

  private buySubscription: Nullable<Subscription> = null;
  private sellSubscription: Nullable<Subscription> = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    reaction(
      () => rootStore.initialized,
      (initialized) => {
        if (!initialized) return;

        this.updateOrderBook();
      },
      { fireImmediately: true },
    );
  }

  get oneSizeOrders() {
    return +new BN(this.amountOfOrders).div(2).toFixed(0) - 1;
  }

  get buyOrders() {
    return this.orderbook.buy
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
    return this.orderbook.sell
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
    const orderbookHeight = isMobile ? 380 : window.innerHeight - 210;
    const rowHeight = 19;
    this.setAmountOfOrders(Math.floor((orderbookHeight - 24) / rowHeight));
  };

  setAmountOfOrders = (value: number) => (this.amountOfOrders = value);

  setDecimalGroup = (value: number) => {
    this.decimalGroup = value;

    const buyOrdersCombinedByDecimal = groupOrders(this.allBuyOrders, value);
    const sellOrdersCombinedByDecimal = groupOrders(this.allSellOrders, value);

    this.setOrderbook({
      buy: buyOrdersCombinedByDecimal,
      sell: sellOrdersCombinedByDecimal,
    });
  };

  setOrderFilter = (value: SPOT_ORDER_FILTER) => (this.orderFilter = value);

  updateOrderBook = async () => {
    const { tradeStore } = this.rootStore;
    const market = tradeStore.market;

    if (!this.rootStore.initialized || !market) return;

    const bcNetwork = FuelNetwork.getInstance();

    const params: GetOrdersParams = {
      limit: 200,
      asset: market.baseToken.assetId,
      status: ["Active"],
    };

    this.subscribeToBuyOrders(bcNetwork, params);
    this.subscribeToSellOrders(bcNetwork, params);
  };

  private subscribeToBuyOrders(bcNetwork: FuelNetwork, params: GetOrdersParams) {
    if (this.buySubscription) {
      this.buySubscription.unsubscribe();
    }

    this.buySubscription = bcNetwork.orderbookSdk.subscribeOrders({ ...params, orderType: OrderType.Buy }).subscribe({
      next: ({ data }) => {
        if (!data) return;

        const buyOrders = formatSpotMarketOrders(data.Order, TOKENS_BY_SYMBOL.USDC.assetId);
        this.allBuyOrders = buyOrders;
        this.updateOrderBookState();
      },
    });
  }

  private subscribeToSellOrders(bcNetwork: FuelNetwork, params: GetOrdersParams) {
    if (this.sellSubscription) {
      this.sellSubscription.unsubscribe();
    }

    this.sellSubscription = bcNetwork.orderbookSdk.subscribeOrders({ ...params, orderType: OrderType.Sell }).subscribe({
      next: ({ data }) => {
        if (!data) return;

        const sellOrders = formatSpotMarketOrders(data.Order, TOKENS_BY_SYMBOL.USDC.assetId);
        this.allSellOrders = sellOrders;
        this.updateOrderBookState();
      },
    });
  }

  private updateOrderBookState() {
    const buyOrdersCombinedByDecimal = groupOrders(this.allBuyOrders, this.decimalGroup);
    const sellOrdersCombinedByDecimal = groupOrders(this.allSellOrders, this.decimalGroup);

    const getPrice = (orders: SpotMarketOrder[], priceType: "max" | "min"): BN => {
      const compareType = priceType === "max" ? "gt" : "lt";
      return orders.reduce(
        (value, order) => (order.price[compareType](value) ? order.price : value),
        orders[0]?.price ?? BN.ZERO,
      );
    };

    const maxBuyPrice = getPrice(this.allBuyOrders, "max");
    const minSellPrice = getPrice(this.allSellOrders, "min");

    if (maxBuyPrice && minSellPrice) {
      const spread = minSellPrice.minus(maxBuyPrice);
      const formattedSpread = BN.formatUnits(spread, DEFAULT_DECIMALS).toSignificant(2);
      const spreadPercent = spread.div(maxBuyPrice).times(100);

      this.setOrderbook({
        buy: buyOrdersCombinedByDecimal,
        sell: sellOrdersCombinedByDecimal,
        spreadPercent: spreadPercent.toFormat(2),
        spreadPrice: formattedSpread,
      });
    } else {
      this.setOrderbook({
        buy: buyOrdersCombinedByDecimal,
        sell: sellOrdersCombinedByDecimal,
        spreadPercent: "0.00",
        spreadPrice: "0.00",
      });
    }
  }

  private setOrderbook = (orderbook: Partial<TOrderbookData>) => {
    this.orderbook = { ...this.orderbook, ...orderbook };
  };
}
