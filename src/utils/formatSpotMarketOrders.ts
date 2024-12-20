import { Order } from "@compolabs/spark-orderbook-ts-sdk";

import { SpotMarketOrder } from "@entity";

export const formatSpotMarketOrders = (orders: Order[], baseAssetId: string, quoteAssetId: string) => {
  return orders.map(
    (order) =>
      new SpotMarketOrder({
        ...order,
        baseAssetId,
        quoteAssetId,
      }),
  );
};
