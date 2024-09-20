import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { observer } from "mobx-react";

import Loader from "@components/Loader";

import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";

import { CreateOrderVMProvider } from "@screens/SpotScreen/RightBlock/CreateOrder/CreateOrderVM";

import SpotScreenDesktop from "./SpotScreenDesktop";
import SpotScreenMobile from "./SpotScreenMobile";

const SpotScreenImpl: React.FC = observer(() => {
  const { tradeStore } = useStores();
  const media = useMedia();

  useEffect(() => {
    document.title = `Spark | ${tradeStore.marketSymbol}`;
  }, [tradeStore.marketSymbol]);

  return media.mobile ? <SpotScreenMobile /> : <SpotScreenDesktop />;
});

const SpotScreen: React.FC = observer(() => {
  const { tradeStore } = useStores();
  const { marketId } = useParams<{ marketId: string }>();

  useEffect(() => {
    tradeStore.selectActiveMarket(marketId);
  }, [marketId]);

  if (!tradeStore.initialized) {
    return <Loader />;
  }

  return (
    // SpotScreenImpl оборачивается в CreateOrderSpotVMProvider чтобы при нажатии на ордер в OrderbookAndTradesInterface устанавливать значение в RightBlock
    <CreateOrderVMProvider>
      <SpotScreenImpl />
    </CreateOrderVMProvider>
  );
});

export default SpotScreen;
