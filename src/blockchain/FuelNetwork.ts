import SparkOrderBookSdk, {
  AssetType,
  CreateOrderParams,
  DepositParams,
  GetOrdersParams,
  OrderType,
  WriteTransactionResponse,
} from "@compolabs/spark-orderbook-ts-sdk";
import { makeObservable } from "mobx";
import { Nullable } from "tsdef";

import { PerpMarket, PerpOrder, PerpPosition, SpotMarketOrder, SpotMarketTrade, Token } from "@src/entity";
import { PerpMarketTrade } from "@src/entity/PerpMarketTrade";
import { FAUCET_AMOUNTS } from "@src/stores/FaucetStore";
import BN from "@src/utils/BN";

import {
  CONTRACT_ADDRESSES,
  INDEXER_URL,
  NETWORK,
  PYTH_URL,
  TOKENS_BY_ASSET_ID,
  TOKENS_BY_SYMBOL,
  TOKENS_LIST,
} from "./constants";
import {
  FetchTradesParams,
  GetSpotTradesParams,
  MarketCreateEvent,
  PerpMaxAbsPositionSize,
  PerpPendingFundingPayment,
  SpotMarketVolume,
} from "./types";
import { WalletManager } from "./WalletManager";

export class FuelNetwork {
  private static instance: Nullable<FuelNetwork> = null;

  private walletManager = new WalletManager();
  private orderbookSdk: SparkOrderBookSdk;

  public network = NETWORK;

  private constructor() {
    makeObservable(this.walletManager);

    this.orderbookSdk = new SparkOrderBookSdk({
      networkUrl: NETWORK.url,
      contractAddresses: CONTRACT_ADDRESSES,
      indexerApiUrl: INDEXER_URL,
      pythUrl: PYTH_URL,
    });
  }

  public static getInstance(): FuelNetwork {
    if (!FuelNetwork.instance) {
      FuelNetwork.instance = new FuelNetwork();
    }
    return FuelNetwork.instance;
  }

  getAddress = (): Nullable<string> => {
    return this.walletManager.address;
  };

  getPrivateKey(): Nullable<string> {
    return this.walletManager.privateKey;
  }

  getBalance = async (accountAddress: string, assetAddress: string): Promise<string> => {
    return this.walletManager.getBalance(accountAddress, assetAddress);
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

  setWallet = async (account: string, wallet?: any): Promise<void> => {
    await this.walletManager.setWallet(account, wallet);
    this.orderbookSdk.setActiveWallet((this.walletManager.wallet as any) ?? undefined);
  };

  connectWalletByPrivateKey = async (privateKey: string): Promise<void> => {
    await this.walletManager.connectByPrivateKey(privateKey, (await this.orderbookSdk.getProvider()) as any);
    this.orderbookSdk.setActiveWallet((this.walletManager.wallet as any) ?? undefined);
  };

  disconnectWallet = (): void => {
    this.walletManager.disconnect();
    this.orderbookSdk.setActiveWallet((this.walletManager.wallet as any) ?? undefined);
  };

  addAssetToWallet = async (assetId: string): Promise<void> => {
    await this.walletManager.addAsset(assetId);
  };

  createSpotOrder = async (deposit: DepositParams, order: CreateOrderParams): Promise<WriteTransactionResponse> => {
    // const token = this.getTokenByAssetId(assetAddress);
    // const asset = this.getAssetFromToken(token);

    return this.orderbookSdk.createOrder(deposit, order);
  };

  cancelSpotOrder = async (order: SpotMarketOrder): Promise<void> => {
    const withdrawAmount = order.orderType === OrderType.Buy ? order.currentQuoteAmount : order.currentAmount;
    const assetType = order.orderType === OrderType.Buy ? AssetType.Quote : AssetType.Base;

    console.log({
      amount: withdrawAmount.toString(),
      assetType: assetType,
    });

    await this.orderbookSdk.cancelOrder(
      {
        amount: withdrawAmount.toString(),
        assetType: assetType,
      },
      order.id,
    );
  };

  mintToken = async (assetAddress: string): Promise<void> => {
    const token = this.getTokenByAssetId(assetAddress);
    const asset = this.getAssetFromToken(token);

    const amount = FAUCET_AMOUNTS[token.symbol].toString();

    await this.orderbookSdk.mintToken(asset, amount);
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

  fetchSpotMarkets = async (limit: number): Promise<MarketCreateEvent[]> => {
    return this.orderbookSdk.fetchMarkets(limit);
  };

  fetchSpotMarketPrice = async (baseTokenAddress: string): Promise<BN> => {
    const token = this.getTokenByAssetId(baseTokenAddress);
    const asset = this.getAssetFromToken(token);

    return this.orderbookSdk.fetchMarketPrice(asset);
  };

  fetchSpotOrders = async (params: GetOrdersParams): Promise<SpotMarketOrder[]> => {
    const orders = await this.orderbookSdk.fetchOrders(params);

    return orders.map(
      (order) =>
        new SpotMarketOrder({
          ...order,
          quoteAssetId: TOKENS_BY_SYMBOL.USDC.assetId,
        }),
    );
  };

  fetchSpotTrades = async (params: GetSpotTradesParams): Promise<SpotMarketTrade[]> => {
    const trades = await this.orderbookSdk.getTradeOrderEvents(params);

    return trades.map(
      (trade) =>
        new SpotMarketTrade({
          ...trade,
          baseAssetId: params.market.baseToken.assetId,
          quoteAssetId: params.market.quoteToken.assetId,
        }),
    );
  };

  fetchSpotVolume = async (): Promise<SpotMarketVolume> => {
    const data = await this.orderbookSdk.fetchVolume();

    return {
      low: new BN(data.low24h),
      high: new BN(data.high24h),
      volume: new BN(data.volume24h),
    };
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
