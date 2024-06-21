import { DEFAULT_DECIMALS } from "@src/constants";
import { SpotMarketOrder } from "@src/entity";

import BN from "./BN";
import { TOKENS_BY_SYMBOL } from "@src/blockchain/constants";

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
        ...order,
        asset: order.baseToken.assetId,
        quoteAssetId: TOKENS_BY_SYMBOL.USDC.assetId,
        order_type: order.orderType,
        price: roundedPrice.toString(),
        amount: order.currentAmount.toString(),
        initial_amount: order.currentAmount.toString(),
        asset_type: order.assetType,
        timestamp: order.timestamp.toString(),
      });
    }
    groupedOrders[price].addInitialAmount(order.initialAmount);
  });

  return Object.values(groupedOrders);
};
