import { Address } from "fuels";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { FuelNetwork } from "@src/blockchain";
import { createToast } from "@src/components/Toast";

import RootStore from "./RootStore";

export interface ISerializedAccountStore {
  privateKey: Nullable<string>;
  address: Nullable<string>;
}

class AccountStore {
  public address: Nullable<string> = null;
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

  setAddress = (address: string) => {
    if (address) {
      const addressInstance = Address.fromDynamicInput(address);
      const bech32 = addressInstance.bech32Address;
      console.log(bech32);
      this.address = bech32;
    } else {
      this.address = "";
    }

    this.serialize();
  };

  get address0x() {
    const address = new Address(this.address as any).toB256();
    return address;
  }

  get isConnected() {
    return !!this.address;
  }

  serialize = (): ISerializedAccountStore => {
    const bcNetwork = FuelNetwork.getInstance();

    return {
      privateKey: bcNetwork?.getPrivateKey() ?? null,
      address: this.address,
    };
  };
}

export default AccountStore;
