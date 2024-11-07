import mixpanel, { Mixpanel } from "mixpanel-browser";
import { makeAutoObservable, reaction } from "mobx";
import { Nullable } from "tsdef";

import RootStore from "@stores/RootStore";

import { CONFIG } from "@utils/getConfig";

const MAINNET_KEY = "1753ab2fe514a08e22df236ff4095905";
const TESTNET_KEY = "126ffbcd33aa8abbf4f91bea25e70cc4";

class MixPanelStore {
  private readonly rootStore: RootStore;

  mixpanel: Nullable<Mixpanel> = null;

  connectButtonUsed = "auto";

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    if (import.meta.env.PROD) {
      if (CONFIG.APP.isMainnet) {
        this.initializeMixpanel(MAINNET_KEY);
      } else {
        this.initializeMixpanel(TESTNET_KEY);
      }
    }

    reaction(
      () => this.rootStore.accountStore.isConnected,
      () => {
        this.trackEvent(MIXPANEL_EVENTS.WALLET_CONNECTED, {
          page_name: window.location.href,
          user_address: this.rootStore.accountStore.address,
          btn_wallet_connect_id: this.connectButtonUsed,
        });
      },
    );
  }

  initializeMixpanel(key: string) {
    mixpanel.init(key, { debug: true });
    this.mixpanel = mixpanel;
  }

  trackEvent(event: MIXPANEL_EVENTS, properties = {}) {
    if (!this.mixpanel) {
      console.warn("Mixpanel is not initialized");
      return;
    }

    this.mixpanel.track(event, properties);
  }
}

export default MixPanelStore;

export enum MIXPANEL_EVENTS {
  CLICK_DASHBOARD = "click_dashboard",
  CLICK_SPOT = "click_spot",
  CLICK_MAX_SPOT = "click_max_spot",
  AGREE_WITH_TERMS = "agree_with_terms",

  WALLET_CONNECTED = "wallet_connected",
  PAGE_VIEW = "page_view",
  CLICK_WALLET = "click_wallet",
  CLICK_ASSETS = "click_assets",
  CLICK_MORE = "click_more",
  CLICK_MORE_DOCS = "click_more_docs",
  CLICK_MORE_GITHUB = "click_more_github",
  CLICK_MORE_X = "click_more_x",
  CLICK_MAX = "click_max",
  CLICK_FEE_ACCORDION = "click_fee_accordion",
  CLICK_FAUCET = "click_faucet",
  CLICK_CURRENCY_PAIR = "click_currency_pair",
  CONFIRM_ORDER = "confirm_order",
  CLICK_CURRENCY_SELL = "click_currency_sell",
  CLICK_SLIPPAGE = "click_slippage",
  CLICK_CURRENCY_BUY = "click_currency_buy",
  CONFIRM_SWAP = "confirm_swap",

  CLICK_BRIDGE = "click_bridge",
  CLICK_POINTS = "click_points",
  CLICK_MORE_FUEL = "click_more_fuel",
  CLICK_LAYER_SWAP = "click_layer",

  CLICK_INTERCOM = "click_intercom",
  CLICK_DISCORD_SIGNIN = "click_discord_signin",
  CLICK_DISCORD_SEND_MESSAGE = "click_discord_send_message",
}
