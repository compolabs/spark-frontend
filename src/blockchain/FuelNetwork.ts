import { Account, B256Address } from "fuels";
import { makeObservable } from "mobx";
import { Nullable } from "tsdef";

import SparkOrderbookSdk, { OrderType, WriteTransactionResponse } from "@compolabs/spark-orderbook-ts-sdk";
import SparkPerpetualSdk from "@compolabs/spark-perpetual-ts-sdk";

import BN from "@utils/BN";
import { CONFIG } from "@utils/getConfig";

import { Token } from "@entity";

import { Balances, SpotMarketVolume } from "./types";
import { WalletManager } from "./WalletManager";

export class FuelNetwork {
  private static instance: Nullable<FuelNetwork> = null;

  private walletManager = new WalletManager();
  private orderbookSdk: SparkOrderbookSdk;
  perpetualSdk: SparkPerpetualSdk;

  private constructor() {
    makeObservable(this.walletManager);

    this.orderbookSdk = new SparkOrderbookSdk({
      networkUrl: CONFIG.APP.links.networkUrl,
      contractAddresses: {
        registry: CONFIG.SPOT.CONTRACTS.registry,
        multiAsset: CONFIG.SPOT.CONTRACTS.multiAsset,
      },
    });

    this.perpetualSdk = new SparkPerpetualSdk({
      networkUrl: CONFIG.APP.links.networkUrl,
    });
  }

  public static getInstance(): FuelNetwork {
    if (!FuelNetwork.instance) {
      FuelNetwork.instance = new FuelNetwork();
    }
    return FuelNetwork.instance;
  }

  getAddress = (): Nullable<B256Address> => {
    return this.walletManager.address;
  };

  getPrivateKey(): Nullable<string> {
    return this.walletManager.privateKey;
  }

  getBalances = async (): Promise<Balances> => {
    return this.walletManager.getBalances();
  };

  getWallet = (): Nullable<any> => {
    return this.walletManager.wallet;
  };

  // TODO: Fix for mobile wallets connected to desktop
  getIsExternalWallet = () => false;

  getTokenList = (): Token[] => {
    return CONFIG.TOKENS;
  };

  getTokenBySymbol = (symbol: string): Token => {
    return CONFIG.TOKENS_BY_SYMBOL[symbol];
  };

  getTokenByAssetId = (assetId: string): Token => {
    return CONFIG.TOKENS_BY_ASSET_ID[assetId.toLowerCase()];
  };

  connect = async (wallet: Account): Promise<void> => {
    await this.walletManager.connect(wallet);

    this.orderbookSdk.setActiveWallet((this.walletManager.wallet as any) ?? undefined);
    this.perpetualSdk.setActiveWallet((this.walletManager.wallet as any) ?? undefined);
  };

  connectWalletByPrivateKey = async (privateKey: string): Promise<void> => {
    const provider = await this.orderbookSdk.getProvider();
    await this.walletManager.connectByPrivateKey(privateKey, provider);

    this.orderbookSdk.setActiveWallet((this.walletManager.wallet as any) ?? undefined);
    this.perpetualSdk.setActiveWallet((this.walletManager.wallet as any) ?? undefined);
  };

  disconnectWallet = async (): Promise<void> => {
    await this.walletManager.disconnect();

    this.orderbookSdk.setActiveWallet(undefined);
    this.perpetualSdk.setActiveWallet(undefined);
  };

  addAssetToWallet = async (assetId: string): Promise<void> => {
    await this.walletManager.addAsset(assetId);
  };

  setSpotSentioConfig = (...params: Parameters<typeof this.orderbookSdk.setSentioConfig>) => {
    this.orderbookSdk.setSentioConfig(...params);
  };

  setSpotActiveMarket = (...params: Parameters<typeof this.orderbookSdk.setActiveMarket>) => {
    this.orderbookSdk.setActiveMarket(...params);
  };

  setPerpActiveMarket = (...params: Parameters<typeof this.perpetualSdk.setActiveMarket>) => {
    this.perpetualSdk.setActiveMarket(...params);
  };

  spotCreateOrder = async (
    ...params: Parameters<typeof this.orderbookSdk.createOrder>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.createOrder(...params);
  };

  spotCreateOrderWithDeposit = async (
    ...params: Parameters<typeof this.orderbookSdk.createOrderWithDeposit>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.createOrderWithDeposit(...params);
  };

  spotSwapTokens = async (
    ...params: Parameters<typeof this.orderbookSdk.fulfillOrderMany>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.fulfillOrderMany(...params);
  };

  spotFulfillOrderManyWithDeposit = async (
    ...params: Parameters<typeof this.orderbookSdk.fulfillOrderManyWithDeposit>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.fulfillOrderManyWithDeposit(...params);
  };

  spotCancelOrder = async (
    ...params: Parameters<typeof this.orderbookSdk.cancelOrder>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.cancelOrder(...params);
  };

  spotMintToken = async (
    ...params: Parameters<typeof this.orderbookSdk.mintToken>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.mintToken(...params);
  };

  spotWithdrawBalance = async (
    ...params: Parameters<typeof this.orderbookSdk.withdrawAssets>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.withdrawAssets(...params);
  };

  spotWithdrawBalanceAll = async (...params: Parameters<typeof this.orderbookSdk.withdrawAllAssets>): Promise<void> => {
    await this.orderbookSdk.withdrawAllAssets(...params);
  };

  spotDepositBalance = async (
    ...params: Parameters<typeof this.orderbookSdk.deposit>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.deposit(...params);
  };

  spotSubscribeOrders = (...params: Parameters<typeof this.orderbookSdk.subscribeOrders>) => {
    return this.orderbookSdk.subscribeOrders(...params);
  };

  perpSubscribeOrders = (...params: Parameters<typeof this.perpetualSdk.subscribeOrders>) => {
    return this.perpetualSdk.subscribeOrders(...params);
  };

  perpSubscribeActiveOrders = <T extends OrderType>(
    ...params: Parameters<typeof this.perpetualSdk.subscribeActiveOrders<T>>
  ): ReturnType<typeof this.perpetualSdk.subscribeActiveOrders<T>> => {
    return this.perpetualSdk.subscribeActiveOrders(...params);
  };

  spotSubscribeActiveOrders = <T extends OrderType>(
    ...params: Parameters<typeof this.orderbookSdk.subscribeActiveOrders<T>>
  ): ReturnType<typeof this.orderbookSdk.subscribeActiveOrders<T>> => {
    return this.orderbookSdk.subscribeActiveOrders(...params);
  };

  perpSubscribeTradeOrderEvents = (
    ...params: Parameters<typeof this.perpetualSdk.subscribeTradeOrderEvents>
  ): ReturnType<typeof this.perpetualSdk.subscribeTradeOrderEvents> => {
    return this.perpetualSdk.subscribeTradeOrderEvents(...params);
  };

  spotSubscribeTradeOrderEvents = (
    ...params: Parameters<typeof this.orderbookSdk.subscribeTradeOrderEvents>
  ): ReturnType<typeof this.orderbookSdk.subscribeTradeOrderEvents> => {
    return this.orderbookSdk.subscribeTradeOrderEvents(...params);
  };

  spotFetchActiveOrders = async (
    ...params: Parameters<typeof this.orderbookSdk.fetchActiveOrders>
  ): ReturnType<typeof this.orderbookSdk.fetchActiveOrders> => {
    return this.orderbookSdk.fetchActiveOrders(...params);
  };

  spotFetchVolume = async (...params: Parameters<typeof this.orderbookSdk.fetchVolume>): Promise<SpotMarketVolume> => {
    const data = await this.orderbookSdk.fetchVolume(...params);

    return {
      low: new BN(data.low24h),
      high: new BN(data.high24h),
      volume: new BN(data.volume24h),
    };
  };

  spotFetchMatcherFee = async () => {
    return this.orderbookSdk.fetchMatcherFee();
  };

  spotFetchProtocolFee = async () => {
    return this.orderbookSdk.fetchProtocolFee();
  };

  spotFetchProtocolFeeForUser = async (...params: Parameters<typeof this.orderbookSdk.fetchProtocolFeeForUser>) => {
    return this.orderbookSdk.fetchProtocolFeeForUser(...params);
  };

  spotFetchProtocolFeeAmountForUser = async (
    ...params: Parameters<typeof this.orderbookSdk.fetchProtocolFeeAmountForUser>
  ) => {
    return this.orderbookSdk.fetchProtocolFeeAmountForUser(...params);
  };

  spotFetchUserMarketBalance = async (...params: Parameters<typeof this.orderbookSdk.fetchUserMarketBalance>) => {
    return this.orderbookSdk.fetchUserMarketBalance(...params);
  };

  spotFetchUserMarketBalanceByContracts = async (
    ...params: Parameters<typeof this.orderbookSdk.fetchUserMarketBalanceByContracts>
  ) => {
    return this.orderbookSdk.fetchUserMarketBalanceByContracts(...params);
  };

  spotChain = async (...params: Parameters<typeof this.orderbookSdk.chain>) => {
    return this.orderbookSdk.chain(...params);
  };

  spotSubscribeUserInfo = (...params: Parameters<typeof this.orderbookSdk.subscribeUserInfo>) => {
    return this.orderbookSdk.subscribeUserInfo(...params);
  };

  subscribeActivePositions = (...params: Parameters<typeof this.perpetualSdk.subscribeActivePositions>) => {
    return this.perpetualSdk.subscribeActivePositions(...params);
  };

  spotFetchMinOrderSize = async () => {
    return this.orderbookSdk.fetchMinOrderSize();
  };

  spotFetchMinOrderPrice = async () => {
    return this.orderbookSdk.fetchMinOrderPrice();
  };

  getUserScoreSnapshot = async (...params: Parameters<typeof this.orderbookSdk.getUserScoreSnapshot>) => {
    return await this.orderbookSdk.getUserScoreSnapshot(...params);
  };

  getTradeEvent = async (...params: Parameters<typeof this.orderbookSdk.getTradeEvent>) => {
    return await this.orderbookSdk.getTradeEvent(...params);
  };

  getLeaderboard = async (...params: Parameters<typeof this.orderbookSdk.getLeaderboard>) => {
    return await this.orderbookSdk.getLeaderboard(...params);
  };
}
