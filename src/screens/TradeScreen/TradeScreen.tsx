import React, { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { observer } from "mobx-react";

import Loader from "@src/components/Loader";
import { useMedia } from "@src/hooks/useMedia";
import { CreateOrderVMProvider } from "@src/screens/TradeScreen/RightBlock/CreateOrder/CreateOrderVM";
import { useStores } from "@stores";

import TradeScreenDesktop from "./TradeScreenDesktop";
import TradeScreenMobile from "./TradeScreenMobile";

const TradeScreenImpl: React.FC = observer(() => {
  const { tradeStore } = useStores();
  const media = useMedia();

  useEffect(() => {
    document.title = `Spark | ${tradeStore.marketSymbol}`;
  }, [tradeStore.marketSymbol]);

  return media.mobile ? <TradeScreenMobile /> : <TradeScreenDesktop />;
});

const TradeScreen: React.FC = observer(() => {
  const { tradeStore } = useStores();
  const location = useLocation();
  const { marketId } = useParams<{ marketId: string }>();

  const isPerp = location.pathname.includes("PERP");
  useEffect(() => {
    tradeStore.selectActiveMarket(isPerp, marketId);
  }, [marketId, isPerp]);

  if (!tradeStore.initialized) {
    return <Loader />;
  }

  return (
    // TradeScreenImpl оборачивается в CreateOrderSpotVMProvider чтобы при нажатии на ордер в OrderbookAndTradesInterface устанавливать значение в RightBlock
    <CreateOrderVMProvider>
      <TradeScreenImpl />
    </CreateOrderVMProvider>
  );
});

export default TradeScreen;
