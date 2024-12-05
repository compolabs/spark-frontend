import React, { ReactNode, useEffect } from "react";

import { useStores } from "@stores";
import { MIXPANEL_EVENTS } from "@stores/MixPanelStore";

interface DiscordProviderProps {
  children: ReactNode;
}

export const DiscordProvider: React.FC<DiscordProviderProps> = ({ children }) => {
  const { accountStore, mixPanelStore } = useStores();

  const trackMenuEvent = (event: MIXPANEL_EVENTS) => {
    mixPanelStore.trackEvent(event, {
      page_name: location.pathname,
      user_address: accountStore.address,
    });
  };

  useEffect(() => {
    if (import.meta.env.DEV) return;

    const loadCrate = () => {
      // @ts-ignore
      const crate = new Crate({
        // ругается, из-за неявного импорта из cdn
        server: "1051946457793581175",
        channel: "1231963066439303290",
      });

      crate.on("alreadySignedIn", () => {
        trackMenuEvent(MIXPANEL_EVENTS.CLICK_DISCORD_SIGNIN);
      });

      crate.on("message", () => {
        trackMenuEvent(MIXPANEL_EVENTS.CLICK_DISCORD_SEND_MESSAGE);
      });
      crate.open();
    };

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@widgetbot/crate@3"; // npm пакет не работает, обновлялся 2 года назад, выдает конфликты, поэтому cdn
    script.async = true;
    script.onload = loadCrate;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return children;
};
