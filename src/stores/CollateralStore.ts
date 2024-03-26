import { makeAutoObservable, reaction, runInAction } from "mobx";

import { Token } from "@src/entity";
import BN from "@src/utils/BN";
import { IntervalUpdater } from "@src/utils/IntervalUpdater";

import RootStore from "./RootStore";

const UPDATE_INTERVAL = 10 * 1000;

export class CollateralStore {
  public balances: Map<string, BN> = new Map();
  public isLoading = false;

  private balancesUpdater: IntervalUpdater;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    this.balancesUpdater = new IntervalUpdater(this.update, UPDATE_INTERVAL);

    this.balancesUpdater.run();

    const { accountStore } = rootStore;

    reaction(
      () => [accountStore.isConnected, accountStore.address],
      ([isConnected]) => {
        if (!isConnected) {
          this.balances = new Map();
          return;
        }

        this.balancesUpdater.update();
      },
      { fireImmediately: true },
    );
  }

  update = async () => {
    const { accountStore, blockchainStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;

    if (!accountStore.isConnected) return;

    try {
      for (const token of bcNetwork!.getTokenList()) {
        const isAvailableToken = bcNetwork!.fetchPerpIsAllowedCollateral(token.assetId);

        if (!isAvailableToken) return;

        const balance = await bcNetwork!.fetchPerpCollateralBalance(accountStore.address!, token.assetId);

        runInAction(() => {
          this.balances.set(token.assetId, balance);
        });
      }
    } catch (error) {
      console.error("[PERP] Error updating token balances:", error);
    }
  };

  deposit = async (token: Token, amount: BN) => {
    const { accountStore, blockchainStore, notificationStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;

    if (!accountStore.isConnected) return;

    this.isLoading = true;

    try {
      await bcNetwork!.depositPerpCollateral(token.assetId, amount.toString());
      notificationStore.toast("Success deposit", { type: "success" });
    } catch (error) {
      notificationStore.toast("Error with deposit", { type: "error" });
    }
    this.isLoading = false;
  };

  withdraw = async (token: Token, amount: BN) => {
    const { accountStore, blockchainStore, notificationStore, oracleStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;

    if (!accountStore.isConnected) return;

    this.isLoading = true;

    try {
      const updateData = await oracleStore.getPriceFeedUpdateData(token.priceFeed);
      console.log(updateData, token, amount);
      await bcNetwork!.withdrawPerpCollateral(token.assetId, amount.toString(), updateData);
      notificationStore.toast("Success withdraw", { type: "success" });
    } catch (error) {
      notificationStore.toast("Error with withdraw", { type: "error" });
    }
    this.isLoading = false;
  };

  getBalance = (assetId: string) => {
    return this.balances.get(assetId) ?? BN.ZERO;
  };

  getFormatBalance = (assetId: string, decimals: number) => {
    return BN.formatUnits(this.getBalance(assetId), decimals).toFormat(2) ?? "-";
  };
}
