import { WalletLocked, WalletUnlocked } from "fuels";

import BN from "@src/utils/BN";

import { MarketStatusOutput } from "./types/clearing-house/ClearingHouseAbi";

export interface Contracts {
  spotMarket: string;
  tokenFactory: string;
  vault: string;
  accountBalance: string;
  clearingHouse: string;
  perpMarket: string;
  pyth: string;
  proxy: string;
}

export interface Asset {
  address: string;
  decimals: number;
}

interface IBaseOptions {
  contractAddresses: Contracts;
  gasPrice: string;
  gasLimit: string;
}

export interface IOptions extends IBaseOptions {
  wallet: WalletLocked | WalletUnlocked;
}

export interface IOptionsSpark extends IBaseOptions {
  wallet?: WalletLocked | WalletUnlocked;
}

export interface SparkParams {
  networkUrl: string;
  contractAddresses: Contracts;
  indexerApiUrl: string;
  wallet?: WalletLocked | WalletUnlocked;
  gasLimit?: string;
  gasPrice?: string;
}

export interface SpotOrder {
  id: string;
  baseToken: string;
  trader: string;
  baseSize: number;
  orderPrice: number;
  blockTimestamp: number;
}

export interface SpotTrades {
  baseToken: string;
  buyer: string;
  id: string;
  matcher: string;
  seller: string;
  tradeAmount: BN;
  price: BN;
  timestamp: number;
  userAddress: string;
}

export interface PerpAllTraderPosition {
  baseTokenAddress: string;
  lastTwPremiumGrowthGlobal: BN;
  takerOpenNational: BN;
  takerPositionSize: BN;
}

export interface PerpMarket {
  baseTokenAddress: string;
  quoteTokenAddress: string;
  imRatio: BN;
  mmRatio: BN;
  status: MarketStatusOutput;
  pausedIndexPrice?: BN;
  pausedTimestamp?: number;
  closedPrice?: BN;
}

export interface PerpTraderOrder {
  id: string;
  baseSize: BN;
  baseTokenAddress: string;
  orderPrice: BN;
  trader: string;
}
