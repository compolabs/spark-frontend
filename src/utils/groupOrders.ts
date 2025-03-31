import BigNumber from "bignumber.js";

import { DEFAULT_DECIMALS } from "@constants";

import { BN } from "@blockchain/fuel/types";
import { SpotMarketOrder } from "@entity";

const roundPrice = (price: BN, decimals: number, rm: BigNumber.RoundingMode): BN => {
  const factor = new BN(10).pow(decimals);
  return new BN(price.dividedBy(factor).integerValue(rm).multipliedBy(factor));
};

export const groupOrders = (
  orders: SpotMarketOrder[],
  decimals: number,
  rm: BigNumber.RoundingMode,
): SpotMarketOrder[] => {
  const groupedOrders: { [key: string]: SpotMarketOrder } = {};
  orders.forEach((order) => {
    const roundedPrice = roundPrice(order.price, DEFAULT_DECIMALS - decimals, rm);
    const price = roundedPrice.toString();

    if (!groupedOrders[price]) {
      groupedOrders[price] = new SpotMarketOrder({
        id: order.id,
        status: "Active",
        user: "",
        price,
        amount: BN.ZERO.toString(),
        initialAmount: BN.ZERO.toString(),
        avrPrice: order.avrPrice,
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
