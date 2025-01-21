import { DEFAULT_DECIMALS } from "@constants";

import { PerpMarketOrder, SpotMarketOrder } from "@entity";

import BN from "./BN";

type MarketOrder = SpotMarketOrder | PerpMarketOrder;

const roundPrice = (price: BN, decimals: number): BN => {
  const factor = new BN(10).pow(decimals);
  return new BN(price.dividedBy(factor).integerValue(BN.ROUND_HALF_UP).multipliedBy(factor));
};

export const groupOrders = <T extends MarketOrder>(orders: T[], decimals: number): T[] => {
  const groupedOrders: { [key: string]: T } = {};

  orders.forEach((order) => {
    const roundedPrice = roundPrice(order.price, DEFAULT_DECIMALS - decimals);
    const price = roundedPrice.toString();

    if (!groupedOrders[price]) {
      groupedOrders[price] = new (order.constructor as { new (...args: any[]): T })({
        id: order.id,
        status: "Active",
        user: "",
        price,
        amount: BN.ZERO.toString(),
        initialAmount: BN.ZERO.toString(),
        orderType: order.orderType,
        asset: order.baseToken.assetId,
        quoteAssetId: order.quoteToken.assetId,
        timestamp: order.timestamp.toString(),
        market: order.market,
      });
    }

    groupedOrders[price].addInitialAmount(order.initialAmount);
    groupedOrders[price].addCurrentAmount(order.currentAmount);
  });

  return Object.values(groupedOrders);
};
