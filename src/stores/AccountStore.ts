import { Account, B256Address } from "fuels";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { FuelNetwork } from "@blockchain";

import RootStore from "./RootStore";

export interface ISerializedAccountStore {
  privateKey: Nullable<string>;
}

class AccountStore {
  initialized = false;

  constructor(
    private rootStore: RootStore,
    initState?: ISerializedAccountStore,
  ) {
    makeAutoObservable(this);
    if (initState) {
      if (initState.privateKey) {
        this.connectWalletByPrivateKey(initState.privateKey);
      }
    }

    this.init();
  }

  init = async () => {
    this.initialized = true;
  };

  connect = async (wallet: Account) => {
    const { notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    try {
      await bcNetwork?.connect(wallet);
    } catch (error: any) {
      notificationStore.error({
        text: "Unexpected error. Please try again.",
      });
    }
  };

  connectWalletByPrivateKey = async (privateKey: string) => {
    // TODO: set address
    const { notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    try {
      await bcNetwork?.connectWalletByPrivateKey(privateKey);
    } catch (error: any) {
      notificationStore.error({
        text: "Unexpected error. Please try again.",
      });
    }
  };

  addAsset = async (assetId: string) => {
    const bcNetwork = FuelNetwork.getInstance();

    await bcNetwork!.addAssetToWallet(assetId);
  };

  disconnect = async () => {
    const bcNetwork = FuelNetwork.getInstance();
    await bcNetwork?.disconnectWallet();
  };

  get address(): Nullable<B256Address> {
    const bcNetwork = FuelNetwork.getInstance();
    return bcNetwork.getAddress();
  }

  get isConnected() {
    const bcNetwork = FuelNetwork.getInstance();

    return !!bcNetwork.getAddress();
  }

  serialize = (): ISerializedAccountStore => {
    const bcNetwork = FuelNetwork.getInstance();
    return {
      privateKey: bcNetwork.getPrivateKey() ?? null,
      // address: bcNetwork.getAddress() ?? null,
    };
  };
}

export default AccountStore;
