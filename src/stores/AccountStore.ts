import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { Blockchain } from "@blockchain";
import { Account, B256Address } from "@blockchain/fuel/types/fuels";

import RootStore from "./RootStore";

export interface SerializedAccountStore {
  privateKey: Nullable<string>;
}

class AccountStore {
  initialized = false;

  constructor(
    private rootStore: RootStore,
    initState?: SerializedAccountStore,
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
    const bcNetwork = Blockchain.getInstance();

    try {
      await bcNetwork.sdk.connect(wallet);
    } catch (error: any) {
      notificationStore.error({
        text: "Unexpected error. Please try again.",
      });
    }
  };

  connectWalletByPrivateKey = async (privateKey: string) => {
    // TODO: set address
    const { notificationStore } = this.rootStore;
    const bcNetwork = Blockchain.getInstance();

    try {
      await bcNetwork.sdk.connectWalletByPrivateKey(privateKey);
    } catch (error: any) {
      notificationStore.error({
        text: "Unexpected error. Please try again.",
      });
    }
  };

  addAsset = async (assetId: string) => {
    const bcNetwork = Blockchain.getInstance();

    await bcNetwork.sdk.addAssetToWallet(assetId);
  };

  disconnect = async () => {
    const bcNetwork = Blockchain.getInstance();
    await bcNetwork.sdk.disconnectWallet();
  };

  get address(): Nullable<B256Address> {
    const bcNetwork = Blockchain.getInstance();
    return bcNetwork.sdk.getAddress();
  }

  get isConnected() {
    const bcNetwork = Blockchain.getInstance();

    return !!bcNetwork.sdk.getAddress();
  }

  serialize = (): SerializedAccountStore => {
    const bcNetwork = Blockchain.getInstance();
    return {
      privateKey: bcNetwork.sdk.getPrivateKey() ?? null,
      // address: bcNetwork.sdk.getAddress() ?? null,
    };
  };
}

export default AccountStore;
