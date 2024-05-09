import { WriteTransactionResponse } from "@compolabs/spark-ts-sdk/dist/interface";
import { Nullable } from "tsdef";

import { PerpMarket, PerpOrder, PerpPosition, SpotMarketOrder, SpotMarketTrade, Token } from "@src/entity";
import BN from "@src/utils/BN";

import {
  FetchOrdersParams,
  FetchTradesParams,
  MarketCreateEvent,
  NETWORK,
  PerpMaxAbsPositionSize,
  PerpPendingFundingPayment,
  SpotMarketVolume,
} from "../types";

export abstract class BlockchainNetwork {
  abstract NETWORK_TYPE: NETWORK;

  abstract getBalance(accountAddress: string, assetAddress: string): Promise<string>;
  abstract getAddress(): Nullable<string>;
  abstract getPrivateKey(): Nullable<string>;
  abstract getIsExternalWallet(): boolean;

  // Tokens
  abstract getTokenList(): Token[];
  abstract getTokenBySymbol(symbol: string): Token;
  abstract getTokenByAssetId(assetId: string): Token;

  // Wallet
  abstract connectWallet(): Promise<void>;
  abstract connectWalletByPrivateKey(privateKey: string): Promise<void>;
  abstract disconnectWallet(): void;
  abstract addAssetToWallet(assetId: string): Promise<void>;

  // Api Contract Orderbook
  abstract createSpotOrder(
    assetAddress: string,
    size: string,
    price: string,
  ): Promise<WriteTransactionResponse | string>;
  abstract cancelSpotOrder(orderId: string): Promise<void>;
  abstract mintToken(assetAddress: string): Promise<void>;
  abstract approve(assetAddress: string, amount: string): Promise<void>;
  abstract allowance(assetAddress: string): Promise<string>;

  // Api Contract Vault
  abstract depositPerpCollateral(assetAddress: string, amount: string): Promise<void>;
  abstract withdrawPerpCollateral(assetAddress: string, amount: string, tokenPriceFeed: string): Promise<void>;
  abstract openPerpOrder(
    assetAddress: string,
    amount: string,
    price: string,
    tokenPriceFeed: string,
  ): Promise<string | WriteTransactionResponse>;
  abstract removePerpOrder(orderId: string): Promise<void>;
  abstract fulfillPerpOrder(orderId: string, amount: string, tokenPriceFeed: string): Promise<void>;

  // Api Fetch Orderbook
  abstract fetchSpotMarkets(limit: number): Promise<MarketCreateEvent[]>;
  abstract fetchSpotMarketPrice(baseTokenAddress: string): Promise<BN>;
  abstract fetchSpotOrders(params: FetchOrdersParams): Promise<SpotMarketOrder[]>;
  abstract fetchSpotTrades(params: FetchTradesParams): Promise<SpotMarketTrade[]>;
  abstract fetchSpotVolume(): Promise<SpotMarketVolume>;

  // Api Fetch Vault
  abstract fetchPerpCollateralBalance(accountAddress: string, assetAddress: string): Promise<BN>;
  abstract fetchPerpAllTraderPositions(
    accountAddress: string,
    assetAddress: string,
    limit: number,
  ): Promise<PerpPosition[]>;
  abstract fetchPerpIsAllowedCollateral(assetAddress: string): Promise<boolean>;
  abstract fetchPerpTraderOrders(
    accountAddress: string,
    assetAddress: string,
    isOpened?: boolean,
    orderType?: "buy" | "sell",
  ): Promise<PerpOrder[]>;
  abstract fetchPerpAllMarkets(): Promise<PerpMarket[]>;
  abstract fetchPerpFundingRate(assetAddress: string): Promise<BN>;
  abstract fetchPerpMaxAbsPositionSize(
    accountAddress: string,
    assetAddress: string,
    tradePrice: string,
  ): Promise<PerpMaxAbsPositionSize>;
  abstract fetchPerpPendingFundingPayment(
    accountAddress: string,
    assetAddress: string,
  ): Promise<PerpPendingFundingPayment>;
  abstract fetchPerpMarkPrice(assetAddress: string): Promise<BN>;
  abstract matchPerpOrders(order1: string, order2: string): Promise<unknown>;
}
