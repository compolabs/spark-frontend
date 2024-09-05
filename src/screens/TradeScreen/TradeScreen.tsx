import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { observer } from "mobx-react";

import Loader from "@components/Loader";

import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";

import { CreateOrderVMProvider } from "@screens/TradeScreen/RightBlock/CreateOrder/CreateOrderVM";

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
  const { marketId } = useParams<{ marketId: string }>();

  useEffect(() => {
    tradeStore.selectActiveMarket(marketId);
  }, [marketId]);

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
