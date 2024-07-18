import mixpanel, { Mixpanel } from "mixpanel-browser";
import { makeAutoObservable } from "mobx";

import RootStore from "@stores/RootStore.ts";

class MixPanelStore {
  mixpanel: Mixpanel | null = null;
  readonly rootStore: RootStore;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
    this.initializeMixpanel();
  }

  initializeMixpanel() {
    mixpanel.init("9c411e1a1ad768d71ba3c9b89c887edb", { debug: true });
    this.mixpanel = mixpanel;
  }

  trackEvent(event: string, properties = {}) {
    if (this.mixpanel) {
      this.mixpanel.track(event, properties);
    } else {
      console.error("Mixpanel is not initialized");
    }
  }
}

export default MixPanelStore;
