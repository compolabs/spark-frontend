import SparkOrderBookSdk, {
  GetActiveOrdersParams,
  Order,
  OrderType,
  UserMarketBalance,
  WriteTransactionResponse,
} from "@compolabs/spark-orderbook-ts-sdk";
import { Account, B256Address, Bech32Address } from "fuels";
import { makeObservable } from "mobx";
import { Nullable } from "tsdef";

import { PerpMarket, PerpMarketTrade, PerpOrder, PerpPosition, SpotMarketOrder, Token } from "@src/entity";
import BN from "@src/utils/BN";
import { CONFIG } from "@src/utils/getConfig";

import {
  Balances,
  FetchTradesParams,
  PerpMaxAbsPositionSize,
  PerpPendingFundingPayment,
  SpotMarketVolume,
} from "./types";
import { WalletManager } from "./WalletManager";

const MARKET = "0x58959d086d8a6ee8cf8eeb572b111edb21661266be4b4885383748d11b72d0aa";

export class FuelNetwork {
  private static instance: Nullable<FuelNetwork> = null;

  private walletManager = new WalletManager();
  private orderbookSdk: SparkOrderBookSdk;

  private constructor() {
    makeObservable(this.walletManager);

    this.orderbookSdk = new SparkOrderBookSdk({
      networkUrl: CONFIG.APP.networkUrl,
      contractAddresses: {
        market: MARKET, // Temporary solution
        orderbook: CONFIG.APP.contracts.orderbook,
        multiAsset: CONFIG.APP.contracts.multiAsset,
      },
      indexerConfig: {
        httpUrl: CONFIG.APP.indexers[MARKET].httpUrl,
        wsUrl: CONFIG.APP.indexers[MARKET].wsUrl,
      },
    });
  }

  public static getInstance(): FuelNetwork {
    if (!FuelNetwork.instance) {
      FuelNetwork.instance = new FuelNetwork();
    }
    return FuelNetwork.instance;
  }

  setActiveMarket = (...params: Parameters<typeof this.orderbookSdk.setActiveMarketAddress>) => {
    this.orderbookSdk.setActiveMarketAddress(...params);
  };

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
  };

  connectWalletByPrivateKey = async (privateKey: string): Promise<void> => {
    const provider = await this.orderbookSdk.getProvider();
    await this.walletManager.connectByPrivateKey(privateKey, provider);
    this.orderbookSdk.setActiveWallet((this.walletManager.wallet as any) ?? undefined);
  };

  disconnectWallet = async (): Promise<void> => {
    await this.walletManager.disconnect();
    this.orderbookSdk.setActiveWallet(undefined);
  };

  addAssetToWallet = async (assetId: string): Promise<void> => {
    await this.walletManager.addAsset(assetId);
  };

  createSpotOrder = async (
    ...params: Parameters<typeof this.orderbookSdk.createOrder>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.createOrder(...params);
  };

  swapTokens = async (
    ...params: Parameters<typeof this.orderbookSdk.fulfillOrderMany>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.fulfillOrderMany(...params);
  };

  cancelSpotOrder = async (
    ...params: Parameters<typeof this.orderbookSdk.cancelOrder>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.cancelOrder(...params);
  };

  mintToken = async (...params: Parameters<typeof this.orderbookSdk.mintToken>): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.mintToken(...params);
  };

  withdrawSpotBalance = async (
    ...params: Parameters<typeof this.orderbookSdk.withdraw>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.withdraw(...params);
  };

  withdrawSpotBalanceAll = async (...params: Parameters<typeof this.orderbookSdk.withdrawAll>): Promise<void> => {
    await this.orderbookSdk.withdrawAll(...params);
  };

  depositSpotBalance = async (
    ...params: Parameters<typeof this.orderbookSdk.deposit>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.deposit(...params);
  };

  subscribeSpotOrders = (...params: Parameters<typeof this.orderbookSdk.subscribeOrders>) => {
    return this.orderbookSdk.subscribeOrders(...params);
  };

  subscribeSpotActiveOrders = <T extends OrderType>(
    ...params: Parameters<typeof this.orderbookSdk.subscribeActiveOrders<T>>
  ): ReturnType<typeof this.orderbookSdk.subscribeActiveOrders<T>> => {
    return this.orderbookSdk.subscribeActiveOrders(...params);
  };

  subscribeSpotTradeOrderEvents = (...params: Parameters<typeof this.orderbookSdk.subscribeTradeOrderEvents>) => {
    return this.orderbookSdk.subscribeTradeOrderEvents(...params);
  };

  depositPerpCollateral = async (assetAddress: string, amount: string): Promise<void> => {
    const token = this.getTokenByAssetId(assetAddress);

    // await this.sdk.depositPerpCollateral(asset, amount);
  };

  withdrawPerpCollateral = async (assetAddress: string, amount: string, tokenPriceFeed: string): Promise<void> => {
    const baseToken = this.getTokenByAssetId(assetAddress);
    const gasToken = this.getTokenBySymbol("ETH");

    // await this.sdk.withdrawPerpCollateral(baseAsset, gasAsset, amount, tokenPriceFeed);
  };

  openPerpOrder = async (
    assetAddress: string,
    amount: string,
    price: string,
    tokenPriceFeed: string,
  ): Promise<string> => {
    const baseToken = this.getTokenByAssetId(assetAddress);
    const gasToken = this.getTokenBySymbol("ETH");

    return "";

    // return this.sdk.openPerpOrder(baseAsset, gasAsset, amount, price, tokenPriceFeed);
  };

  removePerpOrder = async (assetId: string): Promise<void> => {
    // await this.sdk.removePerpOrder(assetId);
  };

  fulfillPerpOrder = async (orderId: string, amount: string, tokenPriceFeed: string): Promise<void> => {
    const gasToken = this.getTokenBySymbol("ETH");

    // await this.sdk.fulfillPerpOrder(gasAsset, orderId, amount, tokenPriceFeed);
  };

  fetchSpotMarketPrice = async (...params: Parameters<typeof this.orderbookSdk.fetchMarketPrice>): Promise<BN> => {
    return this.orderbookSdk.fetchMarketPrice(...params);
  };

  fetchSpotOrders = async (params: GetActiveOrdersParams): Promise<SpotMarketOrder[]> => {
    const { data } = await this.orderbookSdk.fetchActiveOrders(params);

    const formatOrder = (order: Order) =>
      new SpotMarketOrder({
        ...order,
        quoteAssetId: CONFIG.TOKENS_BY_SYMBOL.USDC.assetId,
      });

    if ("ActiveSellOrder" in data) {
      return data.ActiveSellOrder.map(formatOrder);
    } else {
      return data.ActiveBuyOrder.map(formatOrder);
    }
  };

  fetchSpotVolume = async (): Promise<SpotMarketVolume> => {
    const data = await this.orderbookSdk.fetchVolume();

    return {
      low: new BN(data.low24h),
      high: new BN(data.high24h),
      volume: new BN(data.volume24h),
    };
  };

  fetchSpotMatcherFee = async (): Promise<number> => {
    return this.orderbookSdk.fetchMatcherFee();
  };

  fetchSpotUserMarketBalance = async (accountAddress: Bech32Address): Promise<UserMarketBalance> => {
    return this.orderbookSdk.fetchUserMarketBalance(accountAddress);
  };

  matchPerpOrders = async (order1: string, order2: string): Promise<unknown> => {
    return {};
    // return this.sdk.matchPerpOrders(order1, order2);
  };

  fetchPerpTrades = async (params: FetchTradesParams): Promise<PerpMarketTrade[]> => {
    // const trades = await this.sdk.fetchPerpTrades(params);

    // return trades.map(
    //   (obj) => new PerpMarketTrade({ ...obj, userAddress: params.trader, timestamp: Number(obj.timestamp) }),
    // );

    return [];
  };

  fetchPerpCollateralBalance = async (accountAddress: string, assetAddress: string): Promise<BN> => {
    const token = this.getTokenByAssetId(assetAddress);

    // return this.sdk.fetchPerpCollateralBalance(accountAddress, asset);
    return BN.ZERO;
  };

  fetchPerpAllTraderPositions = async (
    accountAddress: string,
    assetAddress: string,
    limit: number,
  ): Promise<PerpPosition[]> => {
    // const positions = await this.sdk.fetchPerpAllTraderPositions(accountAddress, assetAddress, limit);

    // return positions.map((obj) => new PerpPosition(obj));

    return [];
  };

  fetchPerpIsAllowedCollateral = async (assetAddress: string): Promise<boolean> => {
    const token = this.getTokenByAssetId(assetAddress);

    // return this.sdk.fetchPerpIsAllowedCollateral(asset);
    return true;
  };

  fetchPerpTraderOrders = async (
    accountAddress: string,
    assetAddress: string,
    isOpened?: boolean,
    orderType?: "buy" | "sell",
  ): Promise<PerpOrder[]> => {
    const token = this.getTokenByAssetId(assetAddress);

    // const orders = await this.sdk.fetchPerpTraderOrders(accountAddress, asset, isOpened, orderType);

    // return orders.map((obj) => new PerpOrder(obj));
    return [];
  };

  fetchPerpAllMarkets = async (): Promise<PerpMarket[]> => {
    const quoteToken = this.getTokenBySymbol("USDC");
    // const markets = await this.sdk.fetchPerpAllMarkets(assets, quoteAsset);

    // return markets.map((obj) => new PerpMarket(obj));
    return [];
  };

  fetchPerpFundingRate = async (assetAddress: string): Promise<BN> => {
    const token = this.getTokenByAssetId(assetAddress);

    // return this.sdk.fetchPerpFundingRate(asset);
    return BN.ZERO;
  };

  fetchPerpMaxAbsPositionSize = async (
    accountAddress: string,
    assetAddress: string,
    tradePrice: string,
  ): Promise<PerpMaxAbsPositionSize> => {
    const token = this.getTokenByAssetId(assetAddress);

    // return this.sdk.fetchPerpMaxAbsPositionSize(accountAddress, asset, tradePrice);
    return { shortSize: BN.ZERO, longSize: BN.ZERO };
  };

  fetchPerpPendingFundingPayment = async (
    accountAddress: string,
    assetAddress: string,
  ): Promise<PerpPendingFundingPayment> => {
    const token = this.getTokenByAssetId(assetAddress);

    // return this.sdk.fetchPerpPendingFundingPayment(accountAddress, asset);
    return { fundingGrowthPayment: BN.ZERO, fundingPayment: BN.ZERO };
  };

  fetchPerpMarkPrice = async (assetAddress: string): Promise<BN> => {
    const token = this.getTokenByAssetId(assetAddress);

    // return this.sdk.fetchPerpMarkPrice(asset);
    return BN.ZERO;
  };
}
