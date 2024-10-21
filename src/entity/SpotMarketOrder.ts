import dayjs, { Dayjs } from "dayjs";

import { Order } from "@compolabs/spark-orderbook-ts-sdk";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";

import { FuelNetwork } from "@blockchain";

import { Token } from "./Token";

export type SpotMarketOrderParams = {
  quoteAssetId: string;
} & Order;

export class SpotMarketOrder {
  readonly id: Order["id"];
  readonly user: Order["user"];
  readonly orderType: Order["orderType"];
  readonly status: Order["status"];
  readonly market: Order["market"];

  readonly baseToken: Token;
  readonly quoteToken: Token;

  readonly timestamp: Dayjs;

  readonly price: BN;

  initialAmount: BN;
  currentAmount: BN;
  initialQuoteAmount: BN;
  currentQuoteAmount: BN;

  filledAmount: BN;
  filledQuoteAmount: BN;

  constructor(order: SpotMarketOrderParams) {
    const bcNetwork = FuelNetwork.getInstance();

    this.id = order.id;
    this.user = order.user;
    this.status = order.status;

    this.baseToken = bcNetwork.getTokenByAssetId(order.asset);
    this.quoteToken = bcNetwork.getTokenByAssetId(order.quoteAssetId);

    this.orderType = order.orderType;

    this.price = new BN(order.price);

    this.market = order.market;

    this.initialAmount = new BN(order.initialAmount);
    this.initialQuoteAmount = this.getQuoteAmount(this.initialAmount, this.price);

    this.currentAmount = new BN(order.amount);
    this.currentQuoteAmount = this.getQuoteAmount(this.currentAmount, this.price);

    this.filledAmount = this.getFilledAmount(this.initialAmount, this.currentAmount);
    this.filledQuoteAmount = this.getQuoteAmount(this.filledAmount, this.price);

    this.timestamp = dayjs(order.timestamp);
  }

  get marketSymbol() {
    return `${this.baseToken.symbol}-${this.quoteToken.symbol}`;
  }

  get priceUnits(): BN {
    return BN.formatUnits(this.price, DEFAULT_DECIMALS);
  }

  get initialAmountUnits(): BN {
    return BN.formatUnits(this.initialAmount, this.baseToken.decimals);
  }

  get currentAmountUnits(): BN {
    return BN.formatUnits(this.currentAmount, this.baseToken.decimals);
  }

  get filledAmountUnits(): BN {
    return BN.formatUnits(this.filledAmount, this.baseToken.decimals);
  }

  get initialQuoteAmountUnits(): BN {
    return BN.formatUnits(this.initialQuoteAmount, this.quoteToken.decimals);
  }

  get currentQuoteAmountUnits(): BN {
    return BN.formatUnits(this.currentQuoteAmount, this.quoteToken.decimals);
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
