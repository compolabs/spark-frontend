import { Order } from "@compolabs/spark-orderbook-ts-sdk";

import { SpotMarketOrder } from "@entity";

export const formatSpotMarketOrders = (orders: Order[], quoteAssetId: string) => {
  return orders.map(
    (order) =>
      new SpotMarketOrder({
        ...order,
        quoteAssetId,
      }),
  );
};
