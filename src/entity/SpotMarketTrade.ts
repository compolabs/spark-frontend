import { BN, MatchOrderEvent, TradeOrderEvent } from "@compolabs/spark-orderbook-ts-sdk";
import dayjs, { Dayjs } from "dayjs";

import { FuelNetwork } from "@src/blockchain";
import { DEFAULT_DECIMALS } from "@src/constants";

import { Token } from "./Token";

type SpotMarketTradeParams = {
  baseAssetId: string;
  quoteAssetId: string;
} & TradeOrderEvent;

export class SpotMarketTrade {
  readonly id: MatchOrderEvent["id"];

  readonly baseToken: Token;
  readonly quoteToken: Token;

  readonly tradeSize: MatchOrderEvent["match_size"];
  readonly tradePrice: MatchOrderEvent["match_price"];

  readonly timestamp: Dayjs;

  constructor(params: SpotMarketTradeParams) {
    const bcNetwork = FuelNetwork.getInstance();

    this.id = params.id;

    this.baseToken = bcNetwork.getTokenByAssetId(params.baseAssetId);
    this.quoteToken = bcNetwork.getTokenByAssetId(params.quoteAssetId);

    this.tradeSize = params.trade_size;
    this.tradePrice = params.trade_price;

    this.timestamp = dayjs(params.timestamp);
  }

  get formatPrice() {
    return BN.formatUnits(this.tradePrice, DEFAULT_DECIMALS).toSignificant(2);
  }

  get formatTradeAmount() {
    return BN.formatUnits(this.tradeSize, this.baseToken.decimals).toSignificant(2);
  }

  get marketSymbol() {
    return `${this.baseToken.symbol}-${this.quoteToken.symbol}`;
  }
}
