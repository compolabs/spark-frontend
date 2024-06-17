import { makeAutoObservable, reaction, runInAction } from "mobx";

import { FuelNetwork } from "@src/blockchain";
import BN from "@src/utils/BN";
import { IntervalUpdater } from "@src/utils/IntervalUpdater";

import RootStore from "./RootStore";

const UPDATE_INTERVAL = 5 * 1000;

export class BalanceStore {
  public balances: Map<string, BN> = new Map();

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

  get nonZeroBalancesAssetIds() {
    const nonZeroBalances: string[] = [];
    this.balances.forEach((balance, assetId) => {
      if (balance && balance.gt(BN.ZERO)) {
        nonZeroBalances.push(assetId);
      }
    });
    return nonZeroBalances;
  }

  update = async () => {
    const { accountStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();
    const wallet = bcNetwork.getWallet();

    if (!accountStore.address || !wallet) return;

    try {
      for (const token of bcNetwork!.getTokenList()) {
        const balance = await this.fetchBalance(token.assetId);
        runInAction(() => {
          this.balances.set(token.assetId, new BN(balance));
        });
      }
    } catch (error) {
      console.error("Error updating token balances:", error);
    }
  };

  getBalance = (assetId: string) => {
    return this.balances.get(assetId) ?? BN.ZERO;
  };

  getFormatBalance = (assetId: string, decimals: number) => {
    return BN.formatUnits(this.getBalance(assetId), decimals).toSignificant(2) ?? "-";
  };

  private fetchBalance = async (assetId: string): Promise<string> => {
    const { accountStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!accountStore.address) return "0";

    const balance = await bcNetwork!.getBalance(accountStore.address!, assetId);

    return balance;
  };
}
