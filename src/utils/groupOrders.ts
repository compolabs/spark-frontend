import { DEFAULT_DECIMALS } from "@src/constants";
import { SpotMarketOrder } from "@src/entity";

import BN from "./BN";

const roundPrice = (price: BN, decimals: number): BN => {
  const factor = new BN(10).pow(decimals);
  return new BN(price.dividedBy(factor).integerValue(BN.ROUND_HALF_UP).multipliedBy(factor));
};

export const groupOrders = (orders: SpotMarketOrder[], decimals: number): SpotMarketOrder[] => {
  const groupedOrders: { [key: string]: SpotMarketOrder } = {};

  orders.forEach((order) => {
    const roundedPrice = roundPrice(order.price, DEFAULT_DECIMALS - decimals);
    const price = roundedPrice.toString();

    if (!groupedOrders[price]) {
      groupedOrders[price] = new SpotMarketOrder({
        id: order.id,
        baseToken: order.baseToken.assetId,
        trader: order.trader,
        baseSize: BN.ZERO,
        orderPrice: roundedPrice,
        blockTimestamp: order.timestamp.unix(),
      });
    }
    groupedOrders[price].addBaseSize(order.baseSize);
  });

  return Object.values(groupedOrders);
};
