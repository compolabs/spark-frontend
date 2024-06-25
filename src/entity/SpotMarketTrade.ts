import dayjs, { Dayjs } from "dayjs";

import { FuelNetwork } from "@src/blockchain";
import { DEFAULT_DECIMALS } from "@src/constants";
import BN from "@src/utils/BN";

import { Token } from "./Token";
import { MatchOrderEvent, OrderType } from "@compolabs/spark-orderbook-ts-sdk";

type SpotMarketTradeParams = {
  user: string;
  quoteAssetId: string;
} & MatchOrderEvent;

export class SpotMarketTrade {
  readonly id: MatchOrderEvent["id"];

  readonly baseToken: Token;
  readonly quoteToken: Token;

  readonly tradeSize: MatchOrderEvent["match_size"];
  readonly tradePrice: MatchOrderEvent["match_price"];

  readonly type: OrderType;

  readonly timestamp: Dayjs;

  constructor(params: SpotMarketTradeParams) {
    const bcNetwork = FuelNetwork.getInstance();

    this.id = params.id;

    this.baseToken = bcNetwork.getTokenByAssetId(params.asset);
    this.quoteToken = bcNetwork.getTokenByAssetId(params.quoteAssetId);

    this.tradeSize = params.match_size;
    this.tradePrice = params.match_price;

    // TODO: Check assumption
    this.type = params.owner === params.user ? OrderType.Buy : OrderType.Sell;

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
