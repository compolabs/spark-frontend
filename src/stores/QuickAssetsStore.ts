import { makeAutoObservable } from "mobx";

import RootStore from "@stores/RootStore";

interface ISerializedQuickAssetsStore {
  quickAssets?: boolean;
}

class QuickAssetsStore {
  private readonly rootStore: RootStore;

  constructor(rootStore: RootStore, initState?: ISerializedQuickAssetsStore) {
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

  serialize = (): ISerializedQuickAssetsStore => ({
    quickAssets: this.openQuickAssets,
  });
}

export default QuickAssetsStore;
