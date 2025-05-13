import { useEffect, useState } from "react";

import { Blockchain } from "@blockchain";

import { useStores } from "@stores";

import { CONFIG } from "@utils/getConfig";
import { wait } from "@utils/wait";

export const useOrders = () => {
  const { accountStore } = useStores();
  const [activeOrders, setActiveOrders] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const bcNetwork = Blockchain.getInstance();

  const getOrders = async () => {
    setLoading(true);
    const ordersByMarket: Record<string, string[]> = {};

    for (const market of CONFIG.ALL_MARKETS) {
      const indexerInfo = CONFIG.APP.indexers[market.contractId as keyof typeof CONFIG.APP.indexers];
      bcNetwork.sdk.setActiveMarket(market.contractId, indexerInfo);

      try {
        const orderIds = await bcNetwork.sdk.fetchOrderIdsByAddress(accountStore.address! as any);
        if (orderIds.length > 0) {
          ordersByMarket[market.contractId] = orderIds;
          console.log(`✅ ${market.contractId}: ${orderIds.length} orders`);
        }
      } catch (err) {
        console.warn(`⚠️ Failed to fetch orders for ${market.contractId}`, err);
      }

      await wait(1);
    }

    setActiveOrders(ordersByMarket);
    setLoading(false);
  };

  const cancelOrders = async () => {
    setCanceling(true);

    for (const [marketId, orderIds] of Object.entries(activeOrders)) {
      if (!orderIds.length) continue;

      const indexerInfo = CONFIG.APP.indexers[marketId as keyof typeof CONFIG.APP.indexers];
      bcNetwork.sdk.setActiveMarket(marketId, indexerInfo);

      try {
        const result = await bcNetwork.sdk.cancelSpotOrderMutli(orderIds);
        console.log(`🗑️ Cancelled ${orderIds.length} orders in ${marketId}`, result);
      } catch (err) {
        console.error(`❌ Failed to cancel orders in ${marketId}`, err);
      }

      await wait(1);
    }

    setActiveOrders({});
    setCanceling(false);
  };

  useEffect(() => {
    if (accountStore.address) {
      void getOrders();
    }
  }, [accountStore.address]);

  return {
    activeOrders,
    loading,
    canceling,
    cancelOrders,
  };
};
