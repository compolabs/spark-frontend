import { GetTradeOrderEventsParams } from "@compolabs/spark-orderbook-ts-sdk";

import { SpotMarket } from "@src/entity";
import BN from "@src/utils/BN";

// export type FetchOrdersParams = {
//   baseToken: string;
//   limit: number;
//   trader?: string;
//   type?: "BUY" | "SELL";
//   isActive?: boolean;
// };

export type FetchTradesParams = {
  limit: number;
  asset?: string;
  user?: string;
};

export type Market = {
  id: string;
  assetId: string;
  decimal: number;
  contractId: string;
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

export type GetSpotTradesParams = {
  market: SpotMarket;
} & GetTradeOrderEventsParams;
