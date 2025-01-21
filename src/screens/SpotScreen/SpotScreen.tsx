import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { observer } from "mobx-react";

import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";
import { MIXPANEL_EVENTS } from "@stores/MixPanelStore";

import { ROUTES } from "@constants";

import SpotScreenDesktop from "./SpotScreenDesktop";
import SpotScreenMobile from "./SpotScreenMobile";

const SpotScreen: React.FC = observer(() => {
  const { marketStore, mixPanelStore, accountStore } = useStores();
  const { marketId } = useParams<{ marketId: string }>();
  const media = useMedia();

  useEffect(() => {
    marketStore.selectActiveMarket(marketId);
  }, [marketId]);

  useEffect(() => {
    mixPanelStore.trackEvent(MIXPANEL_EVENTS.PAGE_VIEW, {
      page_name: ROUTES.SPOT,
      user_address: accountStore.address,
    });
  }, []);

  useEffect(() => {
    document.title = `V12 | ${marketStore.marketSymbol}`;
  }, [marketStore.marketSymbol]);

  return media.mobile ? <SpotScreenMobile /> : <SpotScreenDesktop />;
});

export default SpotScreen;
