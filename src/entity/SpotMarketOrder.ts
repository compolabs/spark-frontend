import dayjs, { Dayjs } from "dayjs";

import { FuelNetwork } from "@src/blockchain";
import { TOKENS_BY_SYMBOL } from "@src/blockchain/constants";
import { DEFAULT_DECIMALS } from "@src/constants";
import BN from "@src/utils/BN";

import { Token } from "./Token";

export interface SpotMarketOrderParams {
  id: string;
  baseToken: string;
  trader: string;
  baseSize: BN;
  orderPrice: BN;
  blockTimestamp: number;
}

export class SpotMarketOrder {
  // Децимал цены = 9
  // Децимал quoteToken = 6 (USDC)
  readonly id: string;
  readonly timestamp: Dayjs;
  readonly baseToken: Token;
  readonly quoteToken = TOKENS_BY_SYMBOL.USDC; // TODO: Переписать пробрасывать через аргументы;
  readonly trader: string;
  readonly price: BN;
  readonly priceUnits: BN;
  readonly priceScale = 1e9;
  readonly priceDecimals = DEFAULT_DECIMALS;
  readonly type: "BUY" | "SELL";
  baseSize: BN;
  baseSizeUnits: BN;
  quoteSize: BN;
  quoteSizeUnits: BN;

  constructor(order: SpotMarketOrderParams) {
    this.id = order.id;

    const bcNetwork = FuelNetwork.getInstance();
    const baseToken = bcNetwork.getTokenByAssetId(order.baseToken);

    if (!baseToken) {
      throw new Error("Unexpected token");
    }

    this.baseToken = baseToken;

    this.trader = order.trader;
    this.type = order.baseSize.lt(0) ? "SELL" : "BUY";
    this.baseSize = new BN(order.baseSize).abs();
    this.baseSizeUnits = BN.formatUnits(this.baseSize, this.baseToken.decimals);
    this.quoteSize = order.baseSize
      .abs()
      .times(order.orderPrice)
      .times(Math.pow(10, this.quoteToken.decimals))
      .div(Math.pow(10, this.baseToken.decimals) * this.priceScale);

    this.quoteSizeUnits = BN.formatUnits(this.quoteSize, this.quoteToken.decimals);
    this.price = order.orderPrice;
    this.priceUnits = BN.formatUnits(order.orderPrice, this.priceDecimals);
    this.timestamp = dayjs.unix(order.blockTimestamp);
  }

  get marketSymbol() {
    return `${this.baseToken.symbol}-${this.quoteToken.symbol}`;
  }

  addBaseSize = (amount: BN) => {
    this.baseSize = this.baseSize.plus(amount);

    this.baseSizeUnits = BN.formatUnits(this.baseSize, this.baseToken.decimals);
    this.quoteSize = this.baseSize
      .abs()
      .times(this.price)
      .times(Math.pow(10, this.quoteToken.decimals))
      .div(Math.pow(10, this.baseToken.decimals) * this.priceScale);
    this.quoteSizeUnits = BN.formatUnits(this.quoteSize, this.quoteToken.decimals);
  };
}
