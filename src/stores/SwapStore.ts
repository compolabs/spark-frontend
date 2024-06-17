import { makeAutoObservable } from "mobx";

import { FuelNetwork } from "@src/blockchain";
import BN from "@src/utils/BN";

import RootStore from "./RootStore";

class SwapStore {
  readonly rootStore: RootStore;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  get tokens() {
    const { balanceStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    return bcNetwork!.getTokenList().map((v) => {
      const balance = balanceStore.getBalance(v.assetId);
      // const mintAmount = new BN(FAUCET_AMOUNTS[v.symbol] ?? 0);
      const formatBalance = BN.formatUnits(balance ?? BN.ZERO, v.decimals);
      return {
        ...bcNetwork!.getTokenByAssetId(v.assetId),
        ...balance,
        formatBalance,
        // mintAmount,
        // disabled: !AVAILABLE_TOKENS.includes(v.symbol),
      };
    });
  }
}

export default SwapStore;
