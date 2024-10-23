import dayjs, { Dayjs } from "dayjs";

import { BN, TradeOrderEvent } from "@compolabs/spark-orderbook-ts-sdk";

import { DEFAULT_DECIMALS } from "@constants";

import { FuelNetwork } from "@blockchain";

import { Token } from "./Token";

type SpotMarketTradeParams = {
  baseAssetId: string;
  quoteAssetId: string;
} & TradeOrderEvent;

export class SpotMarketTrade {
  readonly id: TradeOrderEvent["id"];

  readonly baseToken: Token;
  readonly quoteToken: Token;

  readonly tradeSize: TradeOrderEvent["tradeSize"];
  readonly tradePrice: TradeOrderEvent["tradePrice"];
  readonly sellerIsMaker: boolean;

  readonly timestamp: Dayjs;

  constructor(params: SpotMarketTradeParams) {
    const bcNetwork = FuelNetwork.getInstance();

    this.id = params.id;

    this.baseToken = bcNetwork.getTokenByAssetId(params.baseAssetId);
    this.quoteToken = bcNetwork.getTokenByAssetId(params.quoteAssetId);

    this.tradeSize = params.tradeSize;
    this.tradePrice = params.tradePrice;

    this.timestamp = dayjs(params.timestamp);
    this.sellerIsMaker = params.sellerIsMaker;
  }

  get formatPrice() {
    return BN.formatUnits(this.tradePrice, DEFAULT_DECIMALS).toFormat(2);
  }

  get formatTradeAmount() {
    return BN.formatUnits(this.tradeSize, this.baseToken.decimals).toFormat(4);
  }

  get marketSymbol() {
    return `${this.baseToken.symbol}-${this.quoteToken.symbol}`;
  }
}
