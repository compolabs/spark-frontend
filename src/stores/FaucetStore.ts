import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { FuelNetwork } from "@src/blockchain";
import { createToast } from "@src/components/Toast";
import { FUEL_FAUCET } from "@src/constants";
import BN from "@src/utils/BN";
import { handleWalletErrors } from "@src/utils/handleWalletErrors";
import RootStore from "@stores/RootStore";

export const FAUCET_AMOUNTS: Record<string, number> = {
  ETH: 0.001,
  USDC: 3000,
  BTC: 0.01,
  UNI: 50,
};
const AVAILABLE_TOKENS = ["ETH", "UNI", "USDC"];

class FaucetStore {
  private readonly rootStore: RootStore;

  loading: boolean = false;
  actionTokenAssetId: Nullable<string> = null;
  initialized: boolean = true;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  get faucetTokens() {
    const { balanceStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    return bcNetwork!.getTokenList().map((v) => {
      const balance = balanceStore.getBalance(v.assetId);
      const mintAmount = new BN(FAUCET_AMOUNTS[v.symbol] ?? 0);
      const formatBalance = BN.formatUnits(balance ?? BN.ZERO, v.decimals);
      return {
        ...bcNetwork!.getTokenByAssetId(v.assetId),
        ...balance,
        formatBalance,
        mintAmount,
        disabled: !AVAILABLE_TOKENS.includes(v.symbol),
      };
    });
  }

  setActionTokenAssetId = (l: Nullable<string>) => (this.actionTokenAssetId = l);

  private mint = async (assetId: string) => {
    const { accountStore, balanceStore, notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();
    try {
      await bcNetwork!.addAssetToWallet(assetId);
    } catch (error: any) {
      console.error(error);
    }
    if (!bcNetwork!.getTokenByAssetId(assetId) || !accountStore.address) return;

    this.setActionTokenAssetId(assetId);
    this.setLoading(true);
    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.toast(createToast({ text: "Please, confirm operation in your wallet" }), { type: "info" });
    }

    try {
      await bcNetwork?.mintToken(assetId);
      notificationStore.toast(createToast({ text: "Minting successful!" }), { type: "success" });
    } catch (error: any) {
      console.log(error);
      handleWalletErrors(notificationStore, error, "We were unable to mint tokens at this time");
    } finally {
      this.setLoading(false);
      await balanceStore.update();
    }
  };

  mintByAssetId = (assetId: string) => {
    const { accountStore, notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();
    const token = bcNetwork?.getTokenByAssetId(assetId);

    if (!token || !accountStore.address) {
      handleWalletErrors(notificationStore, {}, "Please, connect wallet first");
      return;
    }

    if (token.symbol === "ETH") {
      window.open(`${FUEL_FAUCET}${accountStore.address}`, "blank");
      return;
    }

    this.mint(assetId);
  };

  disabled = (assetId: string) => {
    const { accountStore, faucetStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    const token = bcNetwork?.getTokenByAssetId(assetId);
    return (
      faucetStore.loading ||
      !faucetStore.initialized ||
      (token && token.symbol !== "ETH" && accountStore.address === null)
    );
  };

  private setLoading = (l: boolean) => (this.loading = l);
}

export default FaucetStore;
