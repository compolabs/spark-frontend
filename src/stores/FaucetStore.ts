import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import RootStore from "@stores/RootStore";

import { FUEL_FAUCET } from "@constants";
import BN from "@utils/BN";
import { ACTION_MESSAGE_TYPE, getActionMessage } from "@utils/getActionMessage";
import { handleWalletErrors } from "@utils/handleWalletErrors";

import { FuelNetwork } from "@blockchain";

export const FAUCET_AMOUNTS: Record<string, number> = {
  ETH: 0.002,
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
      const balance = balanceStore.getWalletBalance(v.assetId);
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
    const token = bcNetwork.getTokenByAssetId(assetId);

    if (!token || !accountStore.address) return;

    try {
      await bcNetwork!.addAssetToWallet(assetId);
    } catch (error: any) {
      console.error(error);
    }

    this.setActionTokenAssetId(assetId);
    this.setLoading(true);

    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.info({
        text: "Please, confirm operation in your wallet",
      });
    }

    try {
      const amount = FAUCET_AMOUNTS[token.symbol].toString();

      const tx = await bcNetwork?.mintToken(token, amount);
      notificationStore.success({
        text: getActionMessage(ACTION_MESSAGE_TYPE.MINTING_TEST_TOKENS)(amount, token.symbol),
        hash: tx.transactionId,
      });
    } catch (error: any) {
      handleWalletErrors(notificationStore, error, getActionMessage(ACTION_MESSAGE_TYPE.MINTING_TEST_TOKENS_FAILED)());
    }

    this.setLoading(false);
    await balanceStore.update();
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
      window.open(`${FUEL_FAUCET}/?address=${accountStore.address}&redirectUrl=${window.location.origin}`, "blank");
      return;
    }

    this.mint(assetId);
  };

  isDisabled = (assetId: string) => {
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
