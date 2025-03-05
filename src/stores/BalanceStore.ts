import { Address } from "fuels";
import { makeAutoObservable, reaction, runInAction } from "mobx";

import { UserMarketBalance } from "@compolabs/spark-orderbook-ts-sdk";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";
import { ACTION_MESSAGE_TYPE, getActionMessage } from "@utils/getActionMessage";
import { CONFIG } from "@utils/getConfig";
import { handleWalletErrors } from "@utils/handleWalletErrors";
import { IntervalUpdater } from "@utils/IntervalUpdater";

import { FuelNetwork } from "@blockchain";
import { Balances } from "@blockchain/types";

import RootStore from "./RootStore";

const UPDATE_INTERVAL = 5 * 1000;

export class BalanceStore {
  public balances: Map<string, BN> = new Map();
  public contractBalances: Map<string, BN> = new Map();
  public orderBalances: Map<string, BN> = new Map();
  public initialized = false;

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
          this.contractBalances = new Map();
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

  get formattedBalanceInfoList() {
    const { oracleStore } = this.rootStore;

    const bcNetwork = FuelNetwork.getInstance();
    const tokens = bcNetwork.getTokenList();

    return tokens.map((token) => {
      const balance = this.getWalletBalance(token.assetId);
      const contractBalance = this.getContractBalance(token.assetId);
      const orderBalance = this.getOrderBalances(token.assetId);
      const totalBalance = balance.plus(contractBalance);
      return {
        assetId: token.assetId,
        asset: token,
        walletBalance: BN.formatUnits(balance, token.decimals).toString(),
        contractBalance: BN.formatUnits(contractBalance, token.decimals).toString(),
        orderBalance: BN.formatUnits(orderBalance, token.decimals).toString(),
        balance: BN.formatUnits(totalBalance, token.decimals).toString(),
        price: BN.formatUnits(oracleStore.getTokenIndexPrice(token.priceFeed), DEFAULT_DECIMALS).toString(),
      };
    });
  }

  clearBalance = () => {
    this.balances = new Map();
    this.contractBalances = new Map();
    this.orderBalances = new Map();
  };

  update = async () => {
    const { accountStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();
    const wallet = bcNetwork.getWallet();

    if (!accountStore.address || !wallet) return;

    const address = Address.fromB256(accountStore.address);

    const [balances, contractBalances] = await Promise.all([
      this.fetchUserBalances(),
      this.fetchUserContractBalances(address),
    ]);

    try {
      for (const [tokenAddress, balance] of Object.entries(balances)) {
        const isTokenExist = !!bcNetwork.getTokenByAssetId(tokenAddress);

        if (!isTokenExist) continue;

        runInAction(() => {
          this.balances.set(tokenAddress, new BN(balance));
        });
      }

      const aggregatedBalances = CONFIG.MARKETS.reduce(
        (acc, market, index) => {
          const marketBalance = contractBalances[index];

          const baseLiquid = marketBalance ? new BN(marketBalance.liquid.base) : BN.ZERO;
          const quoteLiquid = marketBalance ? new BN(marketBalance.liquid.quote) : BN.ZERO;
          const baseLocked = marketBalance ? new BN(marketBalance.locked.base) : BN.ZERO;
          const quoteLocked = marketBalance ? new BN(marketBalance.locked.quote) : BN.ZERO;

          if (!acc[market.baseAssetId]) {
            acc[market.baseAssetId] = { liquid: BN.ZERO, locked: BN.ZERO };
          }
          acc[market.baseAssetId].liquid = acc[market.baseAssetId].liquid.plus(baseLiquid);
          acc[market.baseAssetId].locked = acc[market.baseAssetId].locked.plus(baseLocked);

          if (!acc[market.quoteAssetId]) {
            acc[market.quoteAssetId] = { liquid: BN.ZERO, locked: BN.ZERO };
          }
          acc[market.quoteAssetId].liquid = acc[market.quoteAssetId].liquid.plus(quoteLiquid);
          acc[market.quoteAssetId].locked = acc[market.quoteAssetId].locked.plus(quoteLocked);

          return acc;
        },
        {} as Record<string, { liquid: BN; locked: BN }>,
      );

      Object.entries(aggregatedBalances).forEach(([assetId, balance]) => {
        this.contractBalances.set(assetId, balance.liquid);
        this.orderBalances.set(assetId, balance.locked);
      });
    } catch (error) {
      console.error("Error updating user balances:", error);
    }
  };

  getWalletBalance = (assetId: string) => {
    return this.balances.get(assetId) ?? BN.ZERO;
  };

  getFormatWalletBalance = (assetId: string, decimals: number) => {
    return BN.formatUnits(this.getWalletBalance(assetId), decimals).toSignificant(2) ?? "-";
  };

  getWalletNativeBalance = () => {
    return this.balances.get(CONFIG.TOKENS_BY_SYMBOL.ETH.assetId) ?? BN.ZERO;
  };

  getContractBalance = (assetId: string) => {
    const amount = this.contractBalances.get(assetId);
    return amount ?? BN.ZERO;
  };

  getOrderBalances = (assetId: string) => {
    const balance = this.orderBalances.get(assetId);
    return balance ?? BN.ZERO;
  };

  getFormatContractBalance = (assetId: string, decimals: number) => {
    return BN.formatUnits(this.getContractBalance(assetId), decimals).toSignificant(2) ?? "-";
  };

  getTotalWithOrderBalance = (assetId: string) => {
    const walletBalance = this.balances.get(assetId) ?? BN.ZERO;
    const contractBalance = this.contractBalances.get(assetId) ?? BN.ZERO;
    const orderBalance = this.orderBalances.get(assetId) ?? BN.ZERO;

    return walletBalance.plus(contractBalance).plus(orderBalance);
  };

  getTotalBalance = (assetId: string) => {
    const walletBalance = this.balances.get(assetId) ?? BN.ZERO;
    const contractBalance = this.contractBalances.get(assetId) ?? BN.ZERO;

    return walletBalance.plus(contractBalance);
  };

  getFormatTotalWithOrderBalance = (assetId: string, decimals: number) => {
    return BN.formatUnits(this.getTotalWithOrderBalance(assetId), decimals).toSignificant(2) ?? "-";
  };

  getFormatTotalBalance = (assetId: string, decimals: number) => {
    return BN.formatUnits(this.getTotalBalance(assetId), decimals).toSignificant(2) ?? "-";
  };

  depositBalance = async (assetId: string, amount: string) => {
    const { notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.info({
        text: "Please, confirm operation in your wallet",
      });
    }
    const token = bcNetwork.getTokenByAssetId(assetId);
    const amountFormatted = BN.formatUnits(amount, token.decimals).toSignificant(2);
    try {
      const tx = await bcNetwork?.depositSpotBalance(token, amount);
      notificationStore.success({
        text: getActionMessage(ACTION_MESSAGE_TYPE.DEPOSITING_TOKENS)(amountFormatted, token.symbol),
        hash: tx.transactionId,
      });
      return true;
    } catch (error: any) {
      handleWalletErrors(
        notificationStore,
        error,
        getActionMessage(ACTION_MESSAGE_TYPE.DEPOSITING_TOKENS_FAILED)(amountFormatted, token.symbol),
      );
      return false;
    }
  };

  withdrawBalance = async (assetId: string, amount: string) => {
    const { notificationStore } = this.rootStore;
    const markets = CONFIG.MARKETS.filter((el) => el.baseAssetId === assetId || el.quoteAssetId === assetId);

    const bcNetwork = FuelNetwork.getInstance();

    const token = bcNetwork.getTokenByAssetId(assetId);

    const amountFormatted = BN.formatUnits(amount, token.decimals).toSignificant(2);

    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.info({
        text: "Please, confirm operation in your wallet",
      });
    }

    try {
      const tx = await bcNetwork?.withdrawSpotAssets(assetId, markets, amount);
      notificationStore.success({
        text: getActionMessage(ACTION_MESSAGE_TYPE.WITHDRAWING_TOKENS)(amountFormatted, token.symbol),
        hash: tx.transactionId,
      });
      return true;
    } catch (error: any) {
      handleWalletErrors(
        notificationStore,
        error,
        getActionMessage(ACTION_MESSAGE_TYPE.WITHDRAWING_TOKENS_FAILED)(amountFormatted, token.symbol),
      );
      return false;
    }
  };

  withdrawBalanceAll = async () => {
    const { notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.info({ text: "Please, confirm operation in your wallet" });
    }

    try {
      await bcNetwork?.withdrawSpotAllAssets(CONFIG.MARKETS);
      notificationStore.success({
        text: getActionMessage(ACTION_MESSAGE_TYPE.WITHDRAWING_ALL_TOKENS)(),
        hash: "",
      });
      return true;
    } catch (error: any) {
      handleWalletErrors(
        notificationStore,
        error,
        getActionMessage(ACTION_MESSAGE_TYPE.WITHDRAWING_ALL_TOKENS_FAILED)(),
      );
      return false;
    }
  };

  private fetchUserBalances = async (): Promise<Balances> => {
    const bcNetwork = FuelNetwork.getInstance();

    return bcNetwork.getBalances();
  };

  private fetchUserContractBalances = async (address: Address): Promise<UserMarketBalance[]> => {
    const bcNetwork = FuelNetwork.getInstance();

    return bcNetwork.fetchUserMarketBalanceByContracts(
      address.bech32Address,
      CONFIG.MARKETS.map((m) => m.contractId),
    );
  };
}
