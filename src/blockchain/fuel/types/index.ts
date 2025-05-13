import { BN } from "@compolabs/spark-orderbook-ts-sdk";

export * from "@compolabs/spark-orderbook-ts-sdk";

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

export type Balances = Record<string, string>;
