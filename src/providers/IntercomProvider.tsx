import { ReactNode, useEffect } from "react";
import Intercom, { onShow } from "@intercom/messenger-js-sdk";

import { useStores } from "@stores";
import { MIXPANEL_EVENTS } from "@stores/MixPanelStore.ts";

interface IntercomProviderProps {
  children: ReactNode;
}

export const IntercomProvider: React.FC<IntercomProviderProps> = ({ children }) => {
  const { accountStore, mixPanelStore } = useStores();
  const trackMenuEvent = (event: MIXPANEL_EVENTS) => {
    mixPanelStore.trackEvent(event, {
      page_name: location.pathname,
      user_address: accountStore.address,
    });
  };

  useEffect(() => {
    if (import.meta.env.DEV) return;

    Intercom({
      app_id: "cqini4oz",
      wallet: accountStore.address,
    });
    onShow(() => {
      trackMenuEvent(MIXPANEL_EVENTS.CLICK_INTERCOM);
    });
  }, [accountStore.address]);

  return children;
};
