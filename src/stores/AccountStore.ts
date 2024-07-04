const bcNetwork = FuelNetwork.getInstance();
import { Account, Address } from "fuels";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { FuelNetwork } from "@src/blockchain";
import { createToast } from "@src/components/Toast";

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
      // TODO: set wallet ?
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
      notificationStore.toast(createToast({ text: "Unexpected error. Please try again." }), { type: "error" });
    }
  };

  connectWalletByPrivateKey = async (privateKey: string) => {
    // TODO: set address
    const { notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    try {
      await bcNetwork?.connectWalletByPrivateKey(privateKey);
    } catch (error: any) {
      notificationStore.toast(createToast({ text: "Unexpected error. Please try again." }), { type: "error" });
    }
  };

  addAsset = async (assetId: string) => {
    const bcNetwork = FuelNetwork.getInstance();

    await bcNetwork!.addAssetToWallet(assetId);
  };

  disconnect = () => {
    const bcNetwork = FuelNetwork.getInstance();

    bcNetwork?.disconnectWallet();
  };

  get address() {
    const bcNetwork = FuelNetwork.getInstance();

    return bcNetwork.getAddress();
  }

  get address0x() {
    const bcNetwork = FuelNetwork.getInstance();

    const address = new Address(bcNetwork.getAddress() as any).toB256();
    return address;
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
