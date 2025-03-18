import { makeAutoObservable } from "mobx";

import RootStore from "@stores/RootStore";

interface SerializedQuickAssetsStore {
  quickAssets?: boolean;
}

class QuickAssetsStore {
  private readonly rootStore: RootStore;

  constructor(rootStore: RootStore, initState?: SerializedQuickAssetsStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    if (initState) {
      this.setQuickAssets(initState.quickAssets ?? false);
    }
  }

  openQuickAssets: boolean = false;
  setQuickAssets = (v: boolean) => (this.openQuickAssets = v);

  currentStep: number = 0;
  setCurrentStep = (v: number) => (this.currentStep = v);

  serialize = (): SerializedQuickAssetsStore => ({
    quickAssets: this.openQuickAssets,
  });
}

export default QuickAssetsStore;
