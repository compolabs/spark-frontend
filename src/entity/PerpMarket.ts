import BN from "@utils/BN";

import { BaseMarket, BaseMarketParams } from "./BaseMarket";

type PerpMarketParams = {
  imRatio: BN;
  mmRatio: BN;
  status: "Opened" | "Paused" | "Closed";
  pausedIndexPrice?: BN;
  pausedTimestamp?: number;
  closedPrice?: BN;
} & BaseMarketParams;

export class PerpMarket extends BaseMarket {
  readonly type = "perp" as const;

  readonly imRatio: PerpMarketParams["imRatio"];
  readonly mmRatio: PerpMarketParams["mmRatio"];
  readonly status: PerpMarketParams["status"];
  readonly pausedIndexPrice: PerpMarketParams["pausedIndexPrice"];
  readonly pausedTimestamp: PerpMarketParams["pausedTimestamp"];
  readonly closedPrice: PerpMarketParams["closedPrice"];

  constructor(params: PerpMarketParams) {
    super({
      baseTokenAddress: params.baseTokenAddress,
      quoteTokenAddress: params.quoteTokenAddress,
      contractAddress: params.contractAddress,
    });

    this.imRatio = params.imRatio;
    this.mmRatio = params.mmRatio;
    this.status = params.status;
    this.pausedIndexPrice = params.pausedIndexPrice;
    this.pausedTimestamp = params.pausedTimestamp;
    this.closedPrice = params.closedPrice;
  }

  get symbol(): string {
    return `${this.baseToken.symbol}-PERP`;
  }

  static isInstance(market: BaseMarket): market is PerpMarket {
    return market.type === "perp";
  }
}
