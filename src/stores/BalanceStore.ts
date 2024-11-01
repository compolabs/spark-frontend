import { Address } from "fuels";
import { makeAutoObservable, reaction, runInAction } from "mobx";

import { UserMarketBalance } from "@compolabs/spark-orderbook-ts-sdk";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";
import { ACTION_MESSAGE_TYPE, getActionMessage } from "@utils/getActionMessage";
import { CONFIG, Market } from "@utils/getConfig";
import { getTokenType } from "@utils/getTokenType";
import { handleWalletErrors } from "@utils/handleWalletErrors";
import { IntervalUpdater } from "@utils/IntervalUpdater";

import { FuelNetwork } from "@blockchain";
import { Balances } from "@blockchain/types";
import { Token } from "@entity";

import RootStore from "./RootStore";

const UPDATE_INTERVAL = 5 * 1000;

interface ContractBalance {
  locked: {
    base: BN;
    quote: BN;
  };
  liquid: {
    base: BN;
    quote: BN;
  };
}

export class BalanceStore {
  public balances: Map<string, BN> = new Map();
  public contractBalances: Map<string, BN> = new Map();
  public initialized = false;

  private balancesUpdater: IntervalUpdater;

  contractBalanceList: Record<string, ContractBalance> = {};

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

  get formattedBalanceInfoList() {
    const { oracleStore } = this.rootStore;

    const formattedBalance: {
      assetId: string;
      asset: Token;
      walletBalance: string;
      contractBalance: string;
      balance: string;
      price: string;
    }[] = [];
    const bcNetwork = FuelNetwork.getInstance();

    const tokens = bcNetwork.getTokenList();

    tokens.forEach((token) => {
      const balance = this.balances.get(token.assetId) ?? BN.ZERO;
      const contractBalance = this.contractBalances.get(token.assetId) ?? BN.ZERO;
      const totalBalance = balance.plus(contractBalance);

      formattedBalance.push({
        assetId: token.assetId,
        asset: token,
        walletBalance: BN.formatUnits(balance, token.decimals).toString(),
        contractBalance: BN.formatUnits(contractBalance, token.decimals).toString(),
        balance: BN.formatUnits(totalBalance, token.decimals).toString(),
        price: BN.formatUnits(oracleStore.getTokenIndexPrice(token.priceFeed), DEFAULT_DECIMALS).toString(),
      });
    });

    return formattedBalance;
  }

  clearBalance = () => {
    this.balances = new Map();
    this.contractBalances = new Map();
    this.contractBalanceList = {};
  };

  update = async () => {
    const { accountStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();
    const wallet = bcNetwork.getWallet();

    if (!accountStore.address || !wallet) return;

    const [balances] = await Promise.all([this.fetchBalances(), this.fetchUserMarketBalanceByContracts()]);

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

  getContractBalance = (assetId: string) => {
    const amount = this.contractBalances.get(assetId);
    return amount ?? BN.ZERO;
  };

  getFormatContractBalance = (assetId: string, decimals: number) => {
    return BN.formatUnits(this.getContractBalance(assetId), decimals).toSignificant(2) ?? "-";
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
      const tx = await bcNetwork?.withdrawSpotBalance(
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

  withdrawBalanceAll = async () => {
    const { notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.info({ text: "Please, confirm operation in your wallet" });
    }

    const markets = CONFIG.MARKETS.map((el) => el.contractId);

    try {
      await bcNetwork?.withdrawSpotBalanceAll(markets);
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

  private fetchBalances = async (): Promise<Balances> => {
    const bcNetwork = FuelNetwork.getInstance();

    return bcNetwork.getBalances();
  };

  private fetchUserMarketBalanceByContracts = async () => {
    const { accountStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!accountStore.address) return;

    try {
      const address = Address.fromB256(accountStore.address);
      const balanceData = await bcNetwork.fetchUserMarketBalanceByContracts(
        address.bech32Address,
        CONFIG.MARKETS.map((m) => m.contractId),
      );
      this.setContractBalanceList(balanceData, CONFIG.MARKETS);
    } catch (error) {
      console.error(error);
    }
  };

  private setContractBalanceList = (balanceList: UserMarketBalance[], markets: Market[]) => {
    const { balanceStore } = this.rootStore;

    let balanceListFromated = {};

    balanceList.forEach((item, key) => {
      balanceListFromated = {
        ...balanceListFromated,
        [markets[key].contractId]: {
          liquid: {
            base: new BN(item.liquid.base),
            quote: new BN(item.liquid.quote),
          },
          locked: {
            base: new BN(item.locked.base),
            quote: new BN(item.locked.quote),
          },
        },
      };
    });

    markets.forEach((market) => {
      const marketBalance = balanceStore.contractBalanceList[market.contractId];

      this.contractBalances.set(market.baseAssetId, new BN(marketBalance?.liquid?.base ?? 0));
      this.contractBalances.set(market.quoteAssetId, new BN(marketBalance?.liquid?.quote ?? 0));
    });

    this.contractBalanceList = balanceListFromated;
  };
}
