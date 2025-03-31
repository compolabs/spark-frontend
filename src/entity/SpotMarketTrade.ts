import dayjs, { Dayjs } from "dayjs";

import { Blockchain } from "@blockchain";
import { BN, TradeOrderEvent } from "@blockchain/fuel/types";

import { DEFAULT_DECIMALS } from "@constants";

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
    const bcNetwork = Blockchain.getInstance();

    this.id = params.id;

    this.baseToken = bcNetwork.sdk.getTokenByAssetId(params.baseAssetId);
    this.quoteToken = bcNetwork.sdk.getTokenByAssetId(params.quoteAssetId);

    this.tradeSize = params.tradeSize;
    this.tradePrice = params.tradePrice;

    this.timestamp = dayjs(params.timestamp);
    this.sellerIsMaker = params.sellerIsMaker;
  }

  get formatPrice() {
    return BN.formatUnits(this.tradePrice, DEFAULT_DECIMALS).toFormat();
  }

  get formatTradeAmount() {
    return BN.formatUnits(this.tradeSize, this.baseToken.decimals).toFormat(4);
  }

  get marketSymbol() {
    return `${this.baseToken.symbol}-${this.quoteToken.symbol}`;
  }
}
