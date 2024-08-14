import { AssetType, UserMarketBalance } from "@compolabs/spark-orderbook-ts-sdk";
import { Address } from "fuels";
import { makeAutoObservable, reaction, runInAction } from "mobx";

import { createToast } from "@components/Toast.tsx";
import { FuelNetwork } from "@src/blockchain";
import { TOKENS_BY_SYMBOL } from "@src/blockchain/constants";
import BN from "@src/utils/BN";
import { handleWalletErrors } from "@src/utils/handleWalletErrors.ts";
import { IntervalUpdater } from "@src/utils/IntervalUpdater";

import RootStore from "./RootStore";

const UPDATE_INTERVAL = 5 * 1000;
const MARKET_BALANCE_UPDATE_INTERVAL = 15 * 1000; // 15 sec

export class BalanceStore {
  public balances: Map<string, BN> = new Map();
  public initialized = false;

  private balancesUpdater: IntervalUpdater;
  private marketBalanceUpdater: IntervalUpdater;

  myMarketBalance = {
    locked: {
      base: BN.ZERO,
      quote: BN.ZERO,
    },
    liquid: {
      base: BN.ZERO,
      quote: BN.ZERO,
    },
  };

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    this.balancesUpdater = new IntervalUpdater(this.update, UPDATE_INTERVAL);

    this.balancesUpdater.run();

    const { accountStore } = rootStore;

    this.marketBalanceUpdater = new IntervalUpdater(this.fetchUserMarketBalance, MARKET_BALANCE_UPDATE_INTERVAL);
    this.marketBalanceUpdater.run(true);
    reaction(
      () => [accountStore.isConnected, accountStore.address],
      ([isConnected]) => {
        if (!isConnected) {
          this.balances = new Map();
          this.initialized = false;
          return;
        }
        this.initialize();
        this.balancesUpdater.update();
      },
      { fireImmediately: true },
    );
  }

  initialize = async () => {
    await this.update();
    runInAction(() => {
      this.initialized = true;
    });
  };

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

  getNativeBalance = () => {
    return this.balances.get(TOKENS_BY_SYMBOL.ETH.assetId) ?? BN.ZERO;
  };

  getContractBalanceInfo = (assetId: string) => {
    const bcNetwork = FuelNetwork.getInstance();

    const token = bcNetwork.getTokenByAssetId(assetId);
    const type = token.symbol === "USDC" ? AssetType.Quote : AssetType.Base;
    const amount =
      type === AssetType.Quote
        ? this.rootStore.balanceStore.myMarketBalance.liquid.quote
        : this.rootStore.balanceStore.myMarketBalance.liquid.base;

    return { amount, type };
  };

  getFormatContractBalanceInfo = (assetId: string, decimals: number) => {
    return BN.formatUnits(this.getContractBalanceInfo(assetId).amount, decimals).toSignificant(2) ?? "-";
  };

  depositBalance = async (assetId: string, amount: number) => {
    const { notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    // if (!this.rootStore.tradeStore.market) return;

    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.toast(createToast({ text: "Please, confirm operation in your wallet" }), { type: "info" });
    }
    const data = bcNetwork.getTokenByAssetId(assetId);
    const asset = {
      address: assetId,
      symbol: data.symbol,
      decimals: data.decimals,
    };
    try {
      await bcNetwork?.depositSpotBalance(amount.toString(), asset);
      notificationStore.toast(createToast({ text: "Deposit request has been sent!" }), { type: "success" });
    } catch (error) {
      console.error(error);
      handleWalletErrors(notificationStore, error, "We were unable to withdraw your token at this time");
    }
  };

  withdrawBalance = async (assetId: string, amount: number) => {
    const { notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    // if (!this.rootStore.tradeStore.market) return;

    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.toast(createToast({ text: "Please, confirm operation in your wallet" }), { type: "info" });
    }
    const { type } = this.getContractBalanceInfo(assetId);

    try {
      await bcNetwork?.withdrawSpotBalance(amount.toString(), type);
      notificationStore.toast(createToast({ text: "Withdrawal request has been sent!" }), { type: "success" });
    } catch (error) {
      console.error(error);
      handleWalletErrors(notificationStore, error, "We were unable to withdraw your token at this time");
    }
  };

  private fetchBalance = async (assetId: string): Promise<string> => {
    const { accountStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!accountStore.address) return "0";

    return await bcNetwork!.getBalance(accountStore.address!, assetId);
  };

  private fetchUserMarketBalance = async () => {
    const { accountStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!accountStore.address) return;

    try {
      // TODO: After type fix in sdk
      const address = Address.fromB256(accountStore.address);
      const balanceData = await bcNetwork.fetchSpotUserMarketBalance(address.bech32Address);
      this.setMyMarketBalance(balanceData);
    } catch (error) {
      console.error(error);
    }
  };

  private setMyMarketBalance = (balance: UserMarketBalance) =>
    (this.myMarketBalance = {
      liquid: {
        base: new BN(balance.liquid.base),
        quote: new BN(balance.liquid.quote),
      },
      locked: {
        base: new BN(balance.locked.base),
        quote: new BN(balance.locked.quote),
      },
    });
}
