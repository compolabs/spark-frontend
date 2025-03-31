import { Order } from "@blockchain/fuel/types";
import { SpotMarketOrder } from "@entity";

export const formatSpotMarketOrders = (orders: Order[], quoteAssetId?: string) => {
  return orders.map(
    (order) =>
      new SpotMarketOrder({
        ...order,
        quoteAssetId,
      }),
  );
};
