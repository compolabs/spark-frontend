import { Address } from "fuels";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { FuelNetwork } from "@src/blockchain";
import { NETWORK_ERROR, NetworkError } from "@src/blockchain/NetworkError";
import { createToast } from "@src/components/Toast";

import RootStore from "./RootStore";

export interface ISerializedAccountStore {
  privateKey: Nullable<string>;
  address: Nullable<string>;
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
      } else if (initState.address) {
        this.connectWallet();
      }
    }

    this.init();
  }

  init = async () => {
    this.initialized = true;
  };

  connectWallet = async () => {
    const { notificationStore } = this.rootStore;

    const bcNetwork = FuelNetwork.getInstance();

    try {
      await bcNetwork?.connectWallet();
    } catch (error: any) {
      console.error("Error connecting to wallet:", error);

      if (error instanceof NetworkError) {
        if (error.code === NETWORK_ERROR.UNKNOWN_ACCOUNT) {
          notificationStore.toast(createToast({ text: "Please authorize the wallet account when connecting." }), {
            type: "info",
          });
          return;
        }
      }

      notificationStore.toast(createToast({ text: "Unexpected error. Please try again." }), { type: "error" });

      try {
        bcNetwork?.disconnectWallet();
      } catch {
        /* empty */
      }
    }
  };

  connectWalletByPrivateKey = async (privateKey: string) => {
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
      address: bcNetwork?.getAddress() ?? null,
    };
  };
}

export default AccountStore;
