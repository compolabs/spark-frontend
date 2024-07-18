import { TOKENS_BY_SYMBOL } from "@src/blockchain/constants";
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
        status: "Active",
        user: "",
        price,
        amount: BN.ZERO.toString(),
        initial_amount: BN.ZERO.toString(),
        order_type: order.orderType,
        asset: order.baseToken.assetId,
        asset_type: order.assetType,
        quoteAssetId: TOKENS_BY_SYMBOL.USDC.assetId,
        timestamp: order.timestamp.toString(),
      });
    }

    groupedOrders[price].addInitialAmount(order.initialAmount);
    groupedOrders[price].addCurrentAmount(order.initialAmount);
  });

  return Object.values(groupedOrders);
};
