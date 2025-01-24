import { Address } from "fuels";
import { makeAutoObservable, reaction, runInAction } from "mobx";

import { UserMarketBalance } from "@compolabs/spark-orderbook-ts-sdk";
import { Deposit } from "@compolabs/spark-perpetual-ts-sdk";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";
import { ACTION_MESSAGE_TYPE, getActionMessage } from "@utils/getActionMessage";
import { CONFIG } from "@utils/getConfig";
import { getTokenType } from "@utils/getTokenType";
import { handleWalletErrors } from "@utils/handleWalletErrors";
import { IntervalUpdater } from "@utils/IntervalUpdater";

import { FuelNetwork } from "@blockchain";
import { Balances } from "@blockchain/types";

import RootStore from "./RootStore";

const UPDATE_INTERVAL = 15 * 1000;

export class BalanceStore {
  public balances: Map<string, BN> = new Map();
  public spotContractBalances: Map<string, BN> = new Map();
  public perpContractBalances: Map<string, BN> = new Map();
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
          this.spotContractBalances = new Map();
          this.perpContractBalances = new Map();
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
    console.log("init");
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
      const spotContractBalance = this.getSpotContractBalance(token.assetId);
      const totalBalance = balance.plus(spotContractBalance);

      return {
        assetId: token.assetId,
        asset: token,
        walletBalance: BN.formatUnits(balance, token.decimals).toString(),
        contractBalance: BN.formatUnits(spotContractBalance, token.decimals).toString(),
        balance: BN.formatUnits(totalBalance, token.decimals).toString(),
        price: BN.formatUnits(oracleStore.getTokenIndexPrice(token.priceFeed), DEFAULT_DECIMALS).toString(),
      };
    });
  }

  clearBalance = () => {
    this.balances = new Map();
    this.spotContractBalances = new Map();
  };

  update = async () => {
    const { accountStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();
    const wallet = bcNetwork.getWallet();

    if (!accountStore.address || !wallet) return;

    const address = Address.fromB256(accountStore.address);
    const [balances, spotContractBalances, perpContractBalances] = await Promise.all([
      this.fetchUserBalances(),
      this.fetchUserSpotContractBalances(address),
      this.fetchUserPerpVaultBalances(),
    ]);

    try {
      for (const [tokenAddress, balance] of Object.entries(balances)) {
        const isTokenExist = !!bcNetwork.getTokenByAssetId(tokenAddress);

        if (!isTokenExist) continue;

        runInAction(() => {
          this.balances.set(tokenAddress, new BN(balance));
        });
      }

      const aggregatedSpotBalances = CONFIG.SPOT.MARKETS.reduce<Record<string, BN>>((acc, market, index) => {
        const marketBalance = spotContractBalances[index];

        const baseAmount = marketBalance ? new BN(marketBalance.liquid.base) : BN.ZERO;
        const quoteAmount = marketBalance ? new BN(marketBalance.liquid.quote) : BN.ZERO;

        acc[market.baseAssetId] = (acc[market.baseAssetId] || BN.ZERO).plus(baseAmount);
        acc[market.quoteAssetId] = (acc[market.quoteAssetId] || BN.ZERO).plus(quoteAmount);

        return acc;
      }, {});

      const aggregatedPerpBalances = perpContractBalances.reduce<Record<string, BN>>((acc, vault) => {
        acc[vault.token.assetId] = (acc[vault.token.assetId] ?? BN.ZERO).plus(vault.balance);
        return acc;
      }, {});

      this.spotContractBalances = new Map(Object.entries(aggregatedSpotBalances));
      this.perpContractBalances = new Map(Object.entries(aggregatedPerpBalances));
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

  getSpotTotalBalance = (assetId: string) => {
    const walletBalance = this.balances.get(assetId) ?? BN.ZERO;
    const spotContractBalance = this.spotContractBalances.get(assetId) ?? BN.ZERO;

    return walletBalance.plus(spotContractBalance);
  };

  getSpotFormatTotalBalance = (assetId: string, decimals: number) => {
    return BN.formatUnits(this.getSpotTotalBalance(assetId), decimals).toSignificant(2) ?? "-";
  };

  getPerpTotalBalance = (assetId: string) => {
    // const walletBalance = this.balances.get(assetId) ?? BN.ZERO;
    const perpContractBalance = this.perpContractBalances.get(assetId) ?? BN.ZERO;

    // return walletBalance.plus(perpContractBalances);
    return perpContractBalance;
  };

  getPerpFormatTotalBalance = (assetId: string, decimals: number) => {
    return BN.formatUnits(this.getPerpTotalBalance(assetId), decimals).toSignificant(2) ?? "-";
  };

  getSpotContractBalance = (assetId: string) => {
    const amount = this.spotContractBalances.get(assetId);
    return amount ?? BN.ZERO;
  };

  getFormatSpotContractBalance = (assetId: string, decimals: number) => {
    return BN.formatUnits(this.getSpotContractBalance(assetId), decimals).toSignificant(2) ?? "-";
  };

  depositSpotBalance = async (assetId: string, amount: string) => {
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
      const tx = await bcNetwork?.spotDepositBalance(token, amount);
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

  depositPerpBalance = async (assetId: string, amount: BN) => {
    const { notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.info({
        text: "Please, confirm operation in your wallet",
      });
    }
    const token = bcNetwork.getTokenByAssetId(assetId);

    const amountBN = BN.formatUnits(amount, token.decimals);
    const amountFormatted = amountBN.toSignificant(2);

    const vaultContract = await bcNetwork.perpetualSdk.getClearingHouseContract(CONFIG.PERP.CONTRACTS.clearingHouse);

    const deposit: Deposit = {
      amount,
      token: token.assetId,
    };

    try {
      const tx = await vaultContract.depositCollateralC(deposit);
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

  withdrawSpotBalance = async (assetId: string, amount: string) => {
    const { notificationStore } = this.rootStore;
    const markets = CONFIG.SPOT.MARKETS.filter((el) => el.baseAssetId === assetId || el.quoteAssetId === assetId);

    const bcNetwork = FuelNetwork.getInstance();

    const token = bcNetwork.getTokenByAssetId(assetId);
    const type = getTokenType(markets, assetId);

    if (!type) {
      handleWalletErrors(
        notificationStore,
        new Error(`Token with assetId "${assetId}" could not be identified as base or quote in the provided markets.`),
        getActionMessage(ACTION_MESSAGE_TYPE.WITHDRAWING_TOKENS_FAILED)(amount, token.symbol),
      );
      return false;
    }

    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.info({
        text: "Please, confirm operation in your wallet",
      });
    }

    try {
      const tx = await bcNetwork?.spotWithdrawBalance(
        type,
        markets.map((m) => m.contractId),
        amount,
      );
      notificationStore.success({
        text: getActionMessage(ACTION_MESSAGE_TYPE.WITHDRAWING_TOKENS)(amount, token.symbol),
        hash: tx.transactionId,
      });
      return true;
    } catch (error: any) {
      handleWalletErrors(
        notificationStore,
        error,
        getActionMessage(ACTION_MESSAGE_TYPE.WITHDRAWING_TOKENS_FAILED)(amount, token.symbol),
      );
      return false;
    }
  };

  withdrawSpotBalanceAll = async () => {
    const { notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.info({ text: "Please, confirm operation in your wallet" });
    }

    const markets = CONFIG.SPOT.MARKETS.map((el) => el.contractId);

    try {
      await bcNetwork?.spotWithdrawBalanceAll(markets);
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

  withdrawPerpBalance = async (assetId: string, amount: BN) => {
    const { notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.info({
        text: "Please, confirm operation in your wallet",
      });
    }
    const token = bcNetwork.getTokenByAssetId(assetId);

    const amountBN = BN.formatUnits(amount, token.decimals);
    const amountFormatted = amountBN.toSignificant(2);

    const vaultContract = await bcNetwork.perpetualSdk.getClearingHouseContract(CONFIG.PERP.CONTRACTS.clearingHouse);

    try {
      const tx = await vaultContract.withdrawCollateralC(assetId, amount, bcNetwork.getAddress()!);
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

  private fetchUserBalances = async (): Promise<Balances> => {
    const bcNetwork = FuelNetwork.getInstance();

    return bcNetwork.getBalances();
  };

  private fetchUserSpotContractBalances = async (address: Address): Promise<UserMarketBalance[]> => {
    const bcNetwork = FuelNetwork.getInstance();

    return bcNetwork.spotFetchUserMarketBalanceByContracts(
      address.bech32Address,
      CONFIG.SPOT.MARKETS.map((m) => m.contractId),
    );
  };

  private fetchUserPerpVaultBalances = async () => {
    const bcNetwork = FuelNetwork.getInstance();

    const vaultContract = await bcNetwork.perpetualSdk.getVaultContract(CONFIG.PERP.CONTRACTS.vault, true);

    const balanceRequests = CONFIG.TOKENS.map(async (token) => {
      const balance = await vaultContract
        .getCollateralBalance(bcNetwork.getAddress()!, token.assetId)
        .catch(() => BN.ZERO);

      return {
        token,
        balance,
      };
    });

    const balances = await Promise.all(balanceRequests);

    return balances;
  };
}
