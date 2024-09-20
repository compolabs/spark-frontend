import React, { useEffect } from "react";
import { Provider, Wallet } from "fuels";
import { observer } from "mobx-react-lite";

import SparkOrderbook, { OrderType } from "@compolabs/spark-orderbook-ts-sdk";

import { SmartFlex } from "./components/SmartFlex";

const TESTNET_NETWORK = "https://testnet.fuel.network/v1/graphql";

// IMPORTANT
// IMPORTANT
// IMPORTANT
const TEST_PRIVATE_KEY = ""; // <-------- Insert private key here (TEST ONLY)
// IMPORTANT
// IMPORTANT
// IMPORTANT

const CONTRACT_ADDRESSES = {
  orderbook: "0x8f7935292f3da69aec797926029c864d7ec6d03c72f7347b4fd517ba4a7b78fb",
  multiAsset: "0xdc527289bdef8ec452f350c9b2d36d464a9ebed88eb389615e512a78e26e3509",
};

const MARKET = "0x416ccdaf69881ae345537b1844d1511b4103379fca43b8c2190aae8b42f08173";

const INDEXER = {
  httpUrl: "https://indexer.bigdevenergy.link/7b34f67/v1/graphql",
  wsUrl: "wss://indexer.bigdevenergy.link/7b34f67/v1/graphql",
};

export const Test: React.FC = observer(() => {
  async function main() {
    const spark = await initializeSparkOrderbook();

    // Subscriptions
    subscribeActiveOrders(spark, OrderType.Buy, 10);
    subscribeActiveOrders(spark, OrderType.Sell, 10);
    subscribeAllOrders(spark, 10);
    subscribeTradeEvents(spark, 10);

    // Fetch requests
    await fetchAllOrders(spark, 10);
    await fetchActiveOrders(spark, OrderType.Buy, 10);
    await fetchActiveOrders(spark, OrderType.Sell, 10);
    await fetchTradeVolume(spark);
  }

  useEffect(() => {
    main().catch(console.error);
  }, []);

  return (
    <SmartFlex height="100vh" center column>
      <h1 style={{ color: "white" }}>Reminder: Ensure to input your private key (/src/Test.tsx:14)</h1>
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
function subscribeActiveOrders(spark: SparkOrderbook, orderType: OrderType, limit: number) {
  // queryObject - ActiveBuyOrder | ActiveSellOrder
  //
  // subscription ${queryObject}Query(
  //   $limit: Int!
  //   $offset: Int!
  //   $where: ${queryObject}_bool_exp
  //   $priceOrder: order_by!
  // ) {
  //   ${queryObject}(limit: $limit, offset: $offset, where: $where, order_by: { price: $priceOrder }) {
  //     id
  //     asset
  //     amount
  //     initial_amount
  //     order_type
  //     price
  //     status
  //     user
  //     timestamp
  //   }
  // }
  const subscription = spark.subscribeActiveOrders<any>({ limit, orderType });
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
  //     id
  //     asset
  //     amount
  //     initial_amount
  //     order_type
  //     price
  //     status
  //     user
  //     timestamp
  //   }
  // }
  const allOrdersSubscription = spark.subscribeOrders({ limit });
  allOrdersSubscription.subscribe((data) => console.log(`subscribeAllOrders`, data.data?.Order));
}

// Subscription to trade events
function subscribeTradeEvents(spark: SparkOrderbook, limit: number) {
  // subscription ($limit: Int!, $orderBy: order_by!) {
  //   TradeOrderEvent(limit: $limit, order_by: { timestamp: $orderBy }) {
  //     id
  //     trade_price
  //     trade_size
  //     timestamp
  //   }
  // }
  const tradeEventsSubscription = spark.subscribeTradeOrderEvents({ limit });
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
  //     id
  //     asset
  //     amount
  //     initial_amount
  //     order_type
  //     price
  //     status
  //     user
  //     timestamp
  //   }
  // }
  const orders = await spark.fetchOrders({ limit });
  console.log(`fetchAllOrders`, orders.data?.Order);
}

// Fetch active orders by type
async function fetchActiveOrders(spark: SparkOrderbook, orderType: OrderType, limit: number) {
  // queryObject - ActiveBuyOrder | ActiveSellOrder
  //
  // query ${queryObject}Query(
  //   $limit: Int!
  //   $offset: Int!
  //   $where: ${queryObject}_bool_exp
  //   $priceOrder: order_by!
  // ) {
  //   ${queryObject}(limit: $limit, offset: $offset, where: $where, order_by: { price: $priceOrder }) {
  //     id
  //     asset
  //     amount
  //     initial_amount
  //     order_type
  //     price
  //     status
  //     user
  //     timestamp
  //   }
  // }
  const activeOrders: any = await spark.fetchActiveOrders<any>({
    limit,
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
  //     id
  //     trade_price
  //     trade_size
  //     timestamp
  //   }
  // }
  const volume = await spark.fetchVolume();
  console.log(`volume`, volume);
}
