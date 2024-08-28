import { AssetType, UserMarketBalance } from "@compolabs/spark-orderbook-ts-sdk";
import { Address } from "fuels";
import { makeAutoObservable, reaction, runInAction } from "mobx";

import { FuelNetwork } from "@src/blockchain";
import { Balances } from "@src/blockchain/types";
import BN from "@src/utils/BN";
import { CONFIG } from "@src/utils/getConfig";
import { IntervalUpdater } from "@src/utils/IntervalUpdater";

import RootStore from "./RootStore";

const UPDATE_INTERVAL = 5 * 1000;

export class BalanceStore {
  public balances: Map<string, BN> = new Map();
  public initialized = false;

  private balancesUpdater: IntervalUpdater;

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

    const [balances] = await Promise.all([this.fetchBalances(), this.fetchUserMarketBalance()]);

    try {
      for (const [tokenAddress, balance] of Object.entries(balances)) {
        const isTokenExist = !!bcNetwork.getTokenByAssetId(tokenAddress);

        if (!isTokenExist) continue;

        runInAction(() => {
          this.balances.set(tokenAddress, new BN(balance));
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
    return this.balances.get(CONFIG.TOKENS_BY_SYMBOL.ETH.assetId) ?? BN.ZERO;
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

  depositBalance = async (assetId: string, amount: string) => {
    const { notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.info({
        text: "Please, confirm operation in your wallet",
      });
    }
    const data = bcNetwork.getTokenByAssetId(assetId);
    const asset = {
      address: assetId,
      symbol: data.symbol,
      decimals: data.decimals,
    };
    // TODO: когда нотификации будут в assets будут переделываться - расскоментировать, return удалить
    // const amountFormatted = BN.formatUnits(amount, data.decimals).toSignificant(2);
    // try {
    //   const tx = await bcNetwork?.depositSpotBalance(amount, asset);
    //   notificationStore.success({
    //     text: getActionMessage(ACTION_MESSAGE_TYPE.DEPOSITING_TOKENS)(amountFormatted, data.symbol),
    //     hash: tx.transactionId,
    //   });
    // } catch (error: any) {
    //   handleWalletErrors(
    //     notificationStore,
    //     error,
    //     getActionMessage(ACTION_MESSAGE_TYPE.DEPOSITING_TOKENS_FAILED)(amountFormatted, data.symbol),
    //   );
    // }
    return bcNetwork?.depositSpotBalance(amount, asset);
  };

  withdrawBalance = async (assetId: string, amount: string) => {
    const { notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    const token = bcNetwork.getTokenByAssetId(assetId);

    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.info({
        text: "Please, confirm operation in your wallet",
      });
    }
    const { type } = this.getContractBalanceInfo(assetId);
    const amountFormatted = BN.formatUnits(amount, token.decimals).toSignificant(2);

    // TODO: когда нотификации будут в assets будут переделываться - расскоментировать, return удалить
    // try {
    //   const tx = await bcNetwork?.withdrawSpotBalance(amount, type);
    //   notificationStore.success({
    //     text: getActionMessage(ACTION_MESSAGE_TYPE.WITHDRAWING_TOKENS)(amountFormatted, token.symbol),
    //     hash: tx.transactionId,
    //   });
    // } catch (error: any) {
    //   handleWalletErrors(
    //     notificationStore,
    //     error,
    //     getActionMessage(ACTION_MESSAGE_TYPE.WITHDRAWING_TOKENS_FAILED)(amountFormatted, token.symbol),
    //   );
    // }
    return bcNetwork?.withdrawSpotBalance(amount, type);
  };

  // withdrawBalanceAll = async (withdrawAssets: any) => {
  //   const { notificationStore } = this.rootStore;
  //   const bcNetwork = FuelNetwork.getInstance();
  //   if (bcNetwork?.getIsExternalWallet()) {
  //     notificationStore.info({ text: "Please, confirm operation in your wallet" });
  //   }
  //   const assets = withdrawAssets.map((el: { assetId: string; balance: number }) => {
  //     console.log("el", el);
  //     const { type } = this.getContractBalanceInfo(el.assetId);
  //     return {
  //       amount: el.balance,
  //       type: type,
  //     };
  //   });
  //   console.log("assets", assets);
  //   return bcNetwork?.withdrawSpotBalanceAll(assets);
  // };

  private fetchBalances = async (): Promise<Balances> => {
    const bcNetwork = FuelNetwork.getInstance();

    return bcNetwork.getBalances();
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
