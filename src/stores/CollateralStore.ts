import { makeAutoObservable, reaction, runInAction } from "mobx";

import { FuelNetwork } from "@src/blockchain";
import { createToast } from "@src/components/Toast";
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
    const { accountStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!accountStore.isConnected) return;

    try {
      for (const token of bcNetwork!.getTokenList()) {
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
    const { accountStore, notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!accountStore.isConnected) return;

    this.isLoading = true;

    try {
      await bcNetwork!.depositPerpCollateral(token.assetId, amount.toString());
      notificationStore.toast(createToast({ text: "Success deposit" }), { type: "success" });
    } catch (error) {
      notificationStore.toast(createToast({ text: "Error with deposit" }), { type: "error" });
    }
    this.isLoading = false;
  };

  withdraw = async (token: Token, amount: BN) => {
    const { accountStore, notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!accountStore.isConnected) return;

    this.isLoading = true;

    try {
      await bcNetwork!.withdrawPerpCollateral(token.assetId, amount.toString(), token.priceFeed);
      notificationStore.toast(createToast({ text: "Success withdraw" }), { type: "success" });
    } catch (error) {
      console.log(error, "error");
      notificationStore.toast(createToast({ text: "Error with withdraw" }), { type: "error" });
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
