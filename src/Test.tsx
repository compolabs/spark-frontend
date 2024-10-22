import React, { useEffect } from "react";
import { Provider, Wallet } from "fuels";
import { observer } from "mobx-react-lite";

import SparkOrderbook, { OrderType } from "@compolabs/spark-orderbook-ts-sdk";

import { SmartFlex } from "./components/SmartFlex";

const TESTNET_NETWORK = "https://testnet.fuel.network/v1/graphql";

const provider = await Provider.create(TESTNET_NETWORK);

const TEST_PRIVATE_KEY = Wallet.generate({ provider }).privateKey;

const CONTRACT_ADDRESSES = {
  registry: "0xd76662328e464549b6f619401992127bed9b5cff3b46a3516e6b509d810b7035",
  multiAsset: "0xdc527289bdef8ec452f350c9b2d36d464a9ebed88eb389615e512a78e26e3509",
};

const MARKET = "0x81acb82a64ff799836c19f4e7f9871cf6d13a1e5d286e815f91c26a1b92a8195";

const INDEXER = {
  httpUrl: "https://indexer.bigdevenergy.link/67b693c/v1/graphql",
  wsUrl: "wss://indexer.bigdevenergy.link/67b693c/v1/graphql",
};

export const Test: React.FC = observer(() => {
  async function main() {
    const spark = await initializeSparkOrderbook();

    // Subscriptions
    subscribeActiveOrders(spark, OrderType.Buy, [MARKET], 10);
    subscribeActiveOrders(spark, OrderType.Sell, [MARKET], 10);
    subscribeAllOrders(spark, 10);
    subscribeTradeEvents(spark, [MARKET], 10);

    // Fetch requests
    await fetchAllOrders(spark, 10);
    await fetchActiveOrders(spark, OrderType.Buy, [MARKET], 10);
    await fetchActiveOrders(spark, OrderType.Sell, [MARKET], 10);
    await fetchTradeVolume(spark);
  }

  useEffect(() => {
    main().catch(console.error);
  }, []);

  return (
    <SmartFlex height="100vh" width="100vw" center column>
      <p style={{ color: "white" }}>Tip: Open the developer tools to view logs</p>
    </SmartFlex>
  );
});

async function initializeSparkOrderbook() {
  const provider = await Provider.create(TESTNET_NETWORK);
  const wallet = Wallet.fromPrivateKey(TEST_PRIVATE_KEY, provider);

  const spark = new SparkOrderbook({
    networkUrl: TESTNET_NETWORK,
    contractAddresses: CONTRACT_ADDRESSES,
    wallet,
  });

  spark.setActiveMarket(MARKET, INDEXER);
  return spark;
}

// Subscription for active orders by type
function subscribeActiveOrders(spark: SparkOrderbook, orderType: OrderType, market: string[], limit: number) {
  // queryObject - ActiveBuyOrder | ActiveSellOrder
  //
  // subscription ${queryObject}Query(
  //   $limit: Int!
  //   $offset: Int!
  //   $where: ${queryObject}_bool_exp
  //   $priceOrder: order_by!
  // ) {
  //   ${queryObject}(limit: $limit, offset: $offset, where: $where, order_by: { price: $priceOrder }) {
  // id
  // market
  // tradeSize
  // tradePrice
  // buyer
  // buyOrderId
  // buyerBaseAmount
  // buyerQuoteAmount
  // seller
  // sellOrderId
  // sellerBaseAmount
  // sellerQuoteAmount
  // sellerIsMaker
  // timestamp
  //   }
  // }
  const subscription = spark.subscribeActiveOrders<any>({ limit, orderType, market });
  subscription.subscribe((data: any) =>
    console.log(
      `subscribeActiveOrders - ${orderType}`,
      orderType === OrderType.Buy ? data.data?.ActiveBuyOrder : data.data?.ActiveSellOrder,
    ),
  );
}

// Subscription to all orders
function subscribeAllOrders(spark: SparkOrderbook, limit: number) {
  // subscription OrderQuery(
  //   $limit: Int!
  //   $offset: Int!
  //   $where: Order_bool_exp
  //   $priceOrder: order_by!
  // ) {
  //   Order(limit: $limit, offset: $offset, where: $where, order_by: { price: $priceOrder }) {
  // id
  // market
  // tradeSize
  // tradePrice
  // buyer
  // buyOrderId
  // buyerBaseAmount
  // buyerQuoteAmount
  // seller
  // sellOrderId
  // sellerBaseAmount
  // sellerQuoteAmount
  // sellerIsMaker
  // timestamp
  //   }
  // }
  const allOrdersSubscription = spark.subscribeOrders({ limit });
  allOrdersSubscription.subscribe((data) => console.log(`subscribeAllOrders`, data.data?.Order));
}

// Subscription to trade events
function subscribeTradeEvents(spark: SparkOrderbook, market: string[], limit: number) {
  // subscription ($limit: Int!, $orderBy: order_by!) {
  //   TradeOrderEvent(limit: $limit, order_by: { timestamp: $orderBy }) {
  //     id
  //     tradePrice
  //     tradeSize
  //     timestamp
  //   }
  // }
  const tradeEventsSubscription = spark.subscribeTradeOrderEvents({ limit, market });
  tradeEventsSubscription.subscribe((data) => console.log(`subscribeTradeEvents`, data.data?.TradeOrderEvent));
}

// Fetch all orders
async function fetchAllOrders(spark: SparkOrderbook, limit: number) {
  // query OrderQuery(
  //   $limit: Int!
  //   $offset: Int!
  //   $where: Order_bool_exp
  //   $priceOrder: order_by!
  // ) {
  //   Order(limit: $limit, offset: $offset, where: $where, order_by: { price: $priceOrder }) {
  // id
  // market
  // tradeSize
  // tradePrice
  // buyer
  // buyOrderId
  // buyerBaseAmount
  // buyerQuoteAmount
  // seller
  // sellOrderId
  // sellerBaseAmount
  // sellerQuoteAmount
  // sellerIsMaker
  // timestamp
  //   }
  // }
  const orders = await spark.fetchOrders({ limit });
  console.log(`fetchAllOrders`, orders.data?.Order);
}

// Fetch active orders by type
async function fetchActiveOrders(spark: SparkOrderbook, orderType: OrderType, market: string[], limit: number) {
  // queryObject - ActiveBuyOrder | ActiveSellOrder
  //
  // query ${queryObject}Query(
  //   $limit: Int!
  //   $offset: Int!
  //   $where: ${queryObject}_bool_exp
  //   $priceOrder: order_by!
  // ) {
  //   ${queryObject}(limit: $limit, offset: $offset, where: $where, order_by: { price: $priceOrder }) {
  // id
  // market
  // tradeSize
  // tradePrice
  // buyer
  // buyOrderId
  // buyerBaseAmount
  // buyerQuoteAmount
  // seller
  // sellOrderId
  // sellerBaseAmount
  // sellerQuoteAmount
  // sellerIsMaker
  // timestamp
  //   }
  // }
  const activeOrders: any = await spark.fetchActiveOrders<any>({
    limit,
    market,
    orderType,
  });
  console.log(
    `fetchActiveOrders - ${orderType}`,
    orderType === OrderType.Buy ? activeOrders.data?.ActiveBuyOrder : activeOrders.data?.ActiveSellOrder,
  );
}

// Fetch trade volume
async function fetchTradeVolume(spark: SparkOrderbook) {
  // query ($limit: Int!, $orderBy: order_by!) {
  //   TradeOrderEvent(limit: $limit, order_by: { timestamp: $orderBy }) {
  //     tradePrice
  //     tradeSize
  //   }
  // }
  const volume = await spark.fetchVolume({
    limit: 100,
    market: [MARKET],
  });
  console.log(`volume`, volume);
}
