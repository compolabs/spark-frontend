import { makeAutoObservable } from "mobx";

import RootStore from "./RootStore";

interface ISerializedQuickAssetsStore {
  quickAssets?: boolean;
}

export class QuickAssetsStore {
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
