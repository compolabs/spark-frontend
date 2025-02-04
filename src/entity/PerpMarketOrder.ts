import dayjs, { Dayjs } from "dayjs";

import { PerpOrder } from "@compolabs/spark-perpetual-ts-sdk";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";
import { CONFIG } from "@utils/getConfig";

import { FuelNetwork } from "@blockchain";

import { Token } from "./Token";

export type PerpMarketOrderParams = {
  quoteAssetId?: string;
  baseAssetId?: string;
} & PerpOrder;

// TODO: implement perp logic for this
export class PerpMarketOrder {
  readonly id: PerpOrder["id"];
  readonly db_write_timestamp: PerpOrder["db_write_timestamp"];
  readonly orderType: PerpOrder["orderType"];
  readonly status: PerpOrder["status"];
  readonly market: PerpOrder["market"];

  readonly baseToken: Token;
  readonly quoteToken: Token;

  readonly timestamp: Dayjs;

  readonly price: BN;
  readonly trader: string;
  readonly baseSize: BN;
  readonly baseSizeI64: BN;

  initialAmount: BN;
  currentAmount: BN;
  initialQuoteAmount: BN;
  currentQuoteAmount: BN;

  filledAmount: BN;
  filledQuoteAmount: BN;

  constructor(order: PerpMarketOrderParams) {
    const bcNetwork = FuelNetwork.getInstance();
    const activeMarket = CONFIG.PERP.MARKETS.find((el) => el.contractId === order.market);

    const baseToken = order.baseAssetId ? order.baseToken : (activeMarket?.baseAssetId ?? "");
    const quoteToken = order.quoteAssetId ?? activeMarket?.quoteAssetId ?? "";

    this.id = order.id;
    this.db_write_timestamp = order.db_write_timestamp;
    this.baseToken = bcNetwork.getTokenByAssetId(baseToken);
    this.quoteToken = bcNetwork.getTokenByAssetId(quoteToken);
    this.baseSizeI64 = new BN(order.baseSizeI64).abs();
    this.baseSize = new BN(order.baseSize).abs();

    this.market = order.market;
    this.orderType = order.orderType;
    this.status = order.status;
    this.timestamp = dayjs(order.timestamp);
    this.trader = order.trader;
    this.price = new BN(order.price);

    this.initialAmount = new BN(order.baseSizeI64);
    this.initialQuoteAmount = this.getQuoteAmount(this.initialAmount, this.price);

    this.currentAmount = new BN(order.baseSize);
    this.currentQuoteAmount = this.getQuoteAmount(this.currentAmount, this.price);

    this.filledAmount = this.getFilledAmount(this.initialAmount, this.currentAmount);
    this.filledQuoteAmount = this.getQuoteAmount(this.filledAmount, this.price);
  }

  get marketSymbol() {
    return `${this.baseToken.symbol}-${this.quoteToken.symbol}`;
  }

  get priceUnits(): BN {
    return BN.formatUnits(this.price, this.baseToken.decimals);
  }

  get initialAmountUnits(): BN {
    return BN.formatUnits(this.initialAmount, this.baseToken.decimals);
  }

  get currentAmountUnits(): BN {
    return BN.formatUnits(this.currentAmount.abs(), this.baseToken.decimals);
  }

  get filledAmountUnits(): BN {
    return BN.formatUnits(this.filledAmount, this.baseToken.decimals);
  }

  get initialQuoteAmountUnits(): BN {
    return BN.formatUnits(this.initialQuoteAmount, this.quoteToken.decimals);
  }

  get currentQuoteAmountUnits(): BN {
    return BN.formatUnits(this.price ?? 0, this.baseToken?.decimals).multipliedBy(
      BN.formatUnits(new BN(this.baseSize), this.baseToken?.decimals),
    );
  }

  get filledQuoteAmountUnits(): BN {
    return BN.formatUnits(this.filledQuoteAmount, this.quoteToken.decimals);
  }

  get formatPrice() {
    return this.priceUnits.toSignificant(2);
  }

  get formatInitialAmount() {
    return this.initialAmountUnits.toSignificant(2);
  }

  get formatCurrentAmount() {
    return this.currentAmountUnits.toSignificant(2);
  }

  get formatFilledAmount() {
    return this.filledAmountUnits.toSignificant(2);
  }

  addInitialAmount = (amount: BN) => {
    this.initialAmount = this.initialAmount.plus(amount);
    this.initialQuoteAmount = this.getQuoteAmount(this.initialAmount, this.price);

    this.filledAmount = this.getFilledAmount(this.initialAmount, this.currentAmount);
  };

  addCurrentAmount = (amount: BN) => {
    this.currentAmount = this.currentAmount.plus(amount);
    this.currentQuoteAmount = this.getQuoteAmount(this.currentAmount, this.price);

    this.filledAmount = this.getFilledAmount(this.initialAmount, this.currentAmount);
  };

  private getQuoteAmount = (amount: BN, price: BN) => {
    const decimalsDiffPrice = Math.abs(DEFAULT_DECIMALS - this.baseToken.decimals);
    const decimalsDiffTokens = 2 * DEFAULT_DECIMALS - this.quoteToken.decimals;

    const result = amount
      .multipliedBy(price)
      .multipliedBy(BN.parseUnits(1, decimalsDiffPrice))
      .dividedToIntegerBy(BN.parseUnits(1, decimalsDiffTokens));

    return new BN(result);
  };

  private getFilledAmount = (initialAmount: BN, currentAmount: BN) => {
    return initialAmount.minus(currentAmount);
  };

  debug = () => {
    return {
      initialAmount: this.initialAmount.toString(),
      currentAmount: this.currentAmount.toString(),
      initialQuoteAmount: this.initialQuoteAmount.toString(),
      currentQuoteAmount: this.currentQuoteAmount.toString(),
      price: this.price.toString(),
    };
  };
}
