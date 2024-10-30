import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { observer } from "mobx-react";

import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";
import { MIXPANEL_EVENTS } from "@stores/MixPanelStore";

import { CreateOrderVMProvider } from "@screens/SpotScreen/RightBlock/CreateOrder/CreateOrderVM";

import { ROUTES } from "@constants";

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
  const { tradeStore, mixPanelStore, accountStore } = useStores();
  const { marketId } = useParams<{ marketId: string }>();

  useEffect(() => {
    tradeStore.selectActiveMarket(marketId);
  }, [marketId]);

  useEffect(() => {
    mixPanelStore.trackEvent(MIXPANEL_EVENTS.PAGE_VIEW, {
      page_name: ROUTES.SPOT,
      user_address: accountStore.address,
    });
  }, []);

  return (
    // SpotScreenImpl оборачивается в CreateOrderSpotVMProvider чтобы при нажатии на ордер в OrderbookAndTradesInterface устанавливать значение в RightBlock
    <CreateOrderVMProvider>
      <SpotScreenImpl />
    </CreateOrderVMProvider>
  );
});

export default SpotScreen;
