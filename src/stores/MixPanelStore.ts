import mixpanel, { Mixpanel } from "mixpanel-browser";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import RootStore from "@stores/RootStore";

class MixPanelStore {
  private readonly rootStore: RootStore;

  mixpanel: Nullable<Mixpanel> = null;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    // TODO: change to env variable
    if (import.meta.env.PROD) {
      this.initializeMixpanel("1753ab2fe514a08e22df236ff4095905");
    } else if (import.meta.env.DEV) {
      this.initializeMixpanel("126ffbcd33aa8abbf4f91bea25e70cc4");
    }
  }

  initializeMixpanel(key: string) {
    mixpanel.init(key, { debug: true });
    this.mixpanel = mixpanel;
  }

  trackEvent(event: string, properties = {}) {
    if (!this.mixpanel) {
      console.error("Mixpanel is not initialized");
      return;
    }

    this.mixpanel.track(event, properties);
  }
}

export default MixPanelStore;
// Event names as constants to avoid typos
export const MIXPANEL_EVENTS = {
  WALLET_CONNECTED: "wallet_connected",
  CLICK_WALLET: "click_wallet",
  PAGE_VIEW: "page_view",
  CLICK_ASSETS: "click_assets",
  CLICK_DASHBOARD: "click_dashboard",
  CLICK_SPOT: "click_spot",
  CLICK_MORE: "click_more",
  CLICK_MORE_DOCS: "click_more_docs",
  CLICK_MORE_GITHUB: "click_more_github",
  CLICK_MORE_X: "click_more_x",
  CLICK_MAX_SPOT: "click_max_spot",
  CLICK_FEE_ACCORDION: "click_fee_accordion",
  CLICK_FAUCET: "click_faucet",
  CLICK_CURRENCY_PAIR: "click_currency_pair",
  CONFIRM_ORDER: "confirm_order",
  AGREE_WITH_TERMS: "agree_with_terms",
} as const;
