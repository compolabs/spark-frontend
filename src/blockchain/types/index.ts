import BN from "@src/utils/BN";

export type FetchTradesParams = {
  limit: number;
  asset?: string;
  user?: string;
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

export type Balances = Record<string, string>;
