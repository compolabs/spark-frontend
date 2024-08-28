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

    if (import.meta.env.PROD) {
      this.initializeMixpanel();
    }
  }

  initializeMixpanel() {
    mixpanel.init("9c411e1a1ad768d71ba3c9b89c887edb", { debug: true });
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
