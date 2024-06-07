import BN from "@src/utils/BN";

export type FetchOrdersParams<T = string> = {
  baseToken: T;
  limit: number;
  trader?: T;
  type?: "BUY" | "SELL";
  isActive?: boolean;
};

export type FetchTradesParams<T = string> = {
  baseToken: T;
  limit: number;
  trader?: T;
};

export type MarketCreateEvent = {
  id: string;
  assetId: string;
  decimal: number;
};

export type SpotMarketVolume = {
  low: BN;
  high: BN;
  volume: BN;
};

export type PerpMarketVolume = {
  predictedFundingRate: BN;
  averageFunding24h: BN;
  openInterest: BN;
  volume24h: BN;
};

export type PerpMaxAbsPositionSize = {
  shortSize: BN;
  longSize: BN;
};

export type PerpPendingFundingPayment = {
  fundingPayment: BN;
  fundingGrowthPayment: BN;
};
