import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { observer } from "mobx-react";

import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";
import { MIXPANEL_EVENTS } from "@stores/MixPanelStore";

import { ROUTES } from "@constants";

import PerpScreenDesktop from "./PerpScreenDesktop";
import PerpScreenMobile from "./PerpScreenMobile";

const PerpScreen: React.FC = observer(() => {
  const { marketStore, mixPanelStore, accountStore } = useStores();
  const { marketId } = useParams<{ marketId: string }>();
  const media = useMedia();

  useEffect(() => {
    marketStore.selectActiveMarket(marketId);
  }, [marketId]);

  useEffect(() => {
    mixPanelStore.trackEvent(MIXPANEL_EVENTS.PAGE_VIEW, {
      page_name: ROUTES.PERP,
      user_address: accountStore.address,
    });
  }, []);

  useEffect(() => {
    document.title = `Spark | ${marketStore.marketSymbol}`;
  }, [marketStore.marketSymbol]);

  return media.mobile ? <PerpScreenMobile /> : <PerpScreenDesktop />;
});

export default PerpScreen;
