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
      const formatBalance = BN.formatUnits(balance ?? BN.ZERO, v.decimals);
      const token = bcNetwork!.getTokenByAssetId(v.assetId);

      return {
        key: token.symbol,
        title: token.name,
        symbol: token.symbol,
        img: token.logo,
        balance: formatBalance?.toFormat(4),
      };
    });
  }
}

export default SwapStore;
