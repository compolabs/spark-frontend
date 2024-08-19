import SparkOrderBookSdk, {
  Asset,
  AssetType,
  CreateOrderParams,
  FulfillOrderManyParams,
  GetActiveOrdersParams,
  Order,
  UserMarketBalance,
  WriteTransactionResponse,
} from "@compolabs/spark-orderbook-ts-sdk";
import { Account, B256Address, Bech32Address } from "fuels";
import { makeObservable } from "mobx";
import { Nullable } from "tsdef";

import { PerpMarket, PerpOrder, PerpPosition, SpotMarketOrder, Token } from "@src/entity";
import { PerpMarketTrade } from "@src/entity/PerpMarketTrade";
import { FAUCET_AMOUNTS } from "@src/stores/FaucetStore";
import BN from "@src/utils/BN";

import {
  CONTRACT_ADDRESSES,
  INDEXER_HTTP_URL,
  INDEXER_WS_URL,
  NETWORK,
  PYTH_URL,
  TOKENS_BY_ASSET_ID,
  TOKENS_BY_SYMBOL,
  TOKENS_LIST,
} from "./constants";
import {
  Balances,
  FetchTradesParams,
  Market,
  PerpMaxAbsPositionSize,
  PerpPendingFundingPayment,
  SpotMarketVolume,
} from "./types";
import { WalletManager } from "./WalletManager";

export class FuelNetwork {
  private static instance: Nullable<FuelNetwork> = null;

  private walletManager = new WalletManager();
  orderbookSdk: SparkOrderBookSdk;

  public network = NETWORK;

  private constructor() {
    makeObservable(this.walletManager);

    this.orderbookSdk = new SparkOrderBookSdk({
      networkUrl: NETWORK.url,
      contractAddresses: CONTRACT_ADDRESSES,
      indexerConfig: {
        httpUrl: INDEXER_HTTP_URL,
        wsUrl: INDEXER_WS_URL,
      },
      pythUrl: PYTH_URL,
    });
  }

  public static getInstance(): FuelNetwork {
    if (!FuelNetwork.instance) {
      FuelNetwork.instance = new FuelNetwork();
    }
    return FuelNetwork.instance;
  }

  setActiveMarket = (marketAddress: string) => {
    this.orderbookSdk.setActiveMarketAddress(marketAddress);
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
    return TOKENS_LIST;
  };

  getTokenBySymbol = (symbol: string): Token => {
    return TOKENS_BY_SYMBOL[symbol];
  };

  getTokenByAssetId = (assetId: string): Token => {
    return TOKENS_BY_ASSET_ID[assetId.toLowerCase()];
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

  disconnectWallet = (): void => {
    this.walletManager.disconnect();
    this.orderbookSdk.setActiveWallet((this.walletManager.wallet as any) ?? undefined);
  };

  addAssetToWallet = async (assetId: string): Promise<void> => {
    await this.walletManager.addAsset(assetId);
  };

  createSpotOrder = async (order: CreateOrderParams): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.createOrder(order);
  };

  swapTokens = async (order: FulfillOrderManyParams): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.fulfillOrderMany(order);
  };

  cancelSpotOrder = async (order: SpotMarketOrder): Promise<void> => {
    await this.orderbookSdk.cancelOrder(order.id);
  };

  mintToken = async (assetAddress: string): Promise<void> => {
    const token = this.getTokenByAssetId(assetAddress);
    const asset = this.getAssetFromToken(token);

    const amount = FAUCET_AMOUNTS[token.symbol].toString();

    await this.orderbookSdk.mintToken(asset, amount);
  };

  withdrawSpotBalance = async (amount: string, assetType: AssetType): Promise<void> => {
    await this.orderbookSdk.withdraw(amount, assetType);
  };

  depositSpotBalance = async (amount: string, asset: Asset): Promise<void> => {
    await this.orderbookSdk.deposit(asset, amount);
  };

  depositPerpCollateral = async (assetAddress: string, amount: string): Promise<void> => {
    const token = this.getTokenByAssetId(assetAddress);
    const asset = this.getAssetFromToken(token);

    // await this.sdk.depositPerpCollateral(asset, amount);
  };

  withdrawPerpCollateral = async (assetAddress: string, amount: string, tokenPriceFeed: string): Promise<void> => {
    const baseToken = this.getTokenByAssetId(assetAddress);
    const baseAsset = this.getAssetFromToken(baseToken);
    const gasToken = this.getTokenBySymbol("ETH");
    const gasAsset = this.getAssetFromToken(gasToken);

    // await this.sdk.withdrawPerpCollateral(baseAsset, gasAsset, amount, tokenPriceFeed);
  };

  openPerpOrder = async (
    assetAddress: string,
    amount: string,
    price: string,
    tokenPriceFeed: string,
  ): Promise<string> => {
    const baseToken = this.getTokenByAssetId(assetAddress);
    const baseAsset = this.getAssetFromToken(baseToken);
    const gasToken = this.getTokenBySymbol("ETH");
    const gasAsset = this.getAssetFromToken(gasToken);

    return "";

    // return this.sdk.openPerpOrder(baseAsset, gasAsset, amount, price, tokenPriceFeed);
  };

  removePerpOrder = async (assetId: string): Promise<void> => {
    // await this.sdk.removePerpOrder(assetId);
  };

  fulfillPerpOrder = async (orderId: string, amount: string, tokenPriceFeed: string): Promise<void> => {
    const gasToken = this.getTokenBySymbol("ETH");
    const gasAsset = this.getAssetFromToken(gasToken);

    // await this.sdk.fulfillPerpOrder(gasAsset, orderId, amount, tokenPriceFeed);
  };

  fetchSpotMarkets = async (): Promise<Market[]> => {
    const quoteToken = this.getTokenBySymbol("USDC");
    const assetIdList: [string, string][] = this.getTokenList().map((token) => [token.assetId, quoteToken.assetId]);
    const markets = await this.orderbookSdk.fetchMarkets(assetIdList);
    const marketIdList = assetIdList.map((pair) => markets[pair[0]]).filter(Boolean) as string[];

    const marketConfigPromises = marketIdList.map((marketId) => this.orderbookSdk.fetchMarketConfig(marketId));

    const marketConfigs = await Promise.all(marketConfigPromises);

    return marketConfigs.map((info, index) => ({
      id: String(index),
      assetId: info.baseAssetId,
      decimal: info.priceDecimals,
      contractId: marketIdList[index],
    }));
  };

  fetchSpotMarketPrice = async (baseTokenAddress: string): Promise<BN> => {
    const token = this.getTokenByAssetId(baseTokenAddress);
    const asset = this.getAssetFromToken(token);

    return this.orderbookSdk.fetchMarketPrice(asset);
  };

  fetchSpotOrders = async (params: GetActiveOrdersParams): Promise<SpotMarketOrder[]> => {
    const { data } = await this.orderbookSdk.fetchActiveOrders(params);

    const formatOrder = (order: Order) =>
      new SpotMarketOrder({
        ...order,
        quoteAssetId: TOKENS_BY_SYMBOL.USDC.assetId,
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
    const asset = this.getAssetFromToken(token);

    // return this.sdk.fetchPerpCollateralBalance(accountAddress, asset);
    return new BN("0");
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
    const asset = this.getAssetFromToken(token);

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
    const asset = this.getAssetFromToken(token);

    // const orders = await this.sdk.fetchPerpTraderOrders(accountAddress, asset, isOpened, orderType);

    // return orders.map((obj) => new PerpOrder(obj));
    return [];
  };

  fetchPerpAllMarkets = async (): Promise<PerpMarket[]> => {
    const assets = this.getTokenList().map((token) => this.getAssetFromToken(token));
    const quoteToken = this.getTokenBySymbol("USDC");
    const quoteAsset = this.getAssetFromToken(quoteToken);
    // const markets = await this.sdk.fetchPerpAllMarkets(assets, quoteAsset);

    // return markets.map((obj) => new PerpMarket(obj));
    return [];
  };

  fetchPerpFundingRate = async (assetAddress: string): Promise<BN> => {
    const token = this.getTokenByAssetId(assetAddress);
    const asset = this.getAssetFromToken(token);

    // return this.sdk.fetchPerpFundingRate(asset);
    return new BN("0");
  };

  fetchPerpMaxAbsPositionSize = async (
    accountAddress: string,
    assetAddress: string,
    tradePrice: string,
  ): Promise<PerpMaxAbsPositionSize> => {
    const token = this.getTokenByAssetId(assetAddress);
    const asset = this.getAssetFromToken(token);

    // return this.sdk.fetchPerpMaxAbsPositionSize(accountAddress, asset, tradePrice);
    return { shortSize: new BN("0"), longSize: new BN("0") };
  };

  fetchPerpPendingFundingPayment = async (
    accountAddress: string,
    assetAddress: string,
  ): Promise<PerpPendingFundingPayment> => {
    const token = this.getTokenByAssetId(assetAddress);
    const asset = this.getAssetFromToken(token);

    // return this.sdk.fetchPerpPendingFundingPayment(accountAddress, asset);
    return { fundingGrowthPayment: new BN("0"), fundingPayment: new BN("0") };
  };

  fetchPerpMarkPrice = async (assetAddress: string): Promise<BN> => {
    const token = this.getTokenByAssetId(assetAddress);
    const asset = this.getAssetFromToken(token);

    // return this.sdk.fetchPerpMarkPrice(asset);
    return new BN("0");
  };

  private getAssetFromToken = (token: Token) => {
    return { address: token.assetId, decimals: token.decimals, symbol: token.symbol };
  };
}
