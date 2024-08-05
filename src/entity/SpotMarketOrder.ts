import { Order } from "@compolabs/spark-orderbook-ts-sdk";
import dayjs, { Dayjs } from "dayjs";

import { FuelNetwork } from "@src/blockchain";
import { DEFAULT_DECIMALS } from "@src/constants";
import BN from "@src/utils/BN";

import "./test";

import { Token } from "./Token";

export type SpotMarketOrderParams = {
  quoteAssetId: string;
} & Order;

export class SpotMarketOrder {
  readonly id: Order["id"];
  readonly user: Order["user"];
  readonly orderType: Order["order_type"];
  readonly assetType: Order["asset_type"];
  readonly status: Order["status"];

  readonly baseToken: Token;
  readonly quoteToken: Token;

  readonly timestamp: Dayjs;

  readonly price: BN;

  initialAmount: BN;
  currentAmount: BN;
  initialQuoteAmount: BN;
  currentQuoteAmount: BN;

  constructor(order: SpotMarketOrderParams) {
    const bcNetwork = FuelNetwork.getInstance();

    this.id = order.id;
    this.user = order.user;
    this.status = order.status;

    this.baseToken = bcNetwork.getTokenByAssetId(order.asset);
    this.quoteToken = bcNetwork.getTokenByAssetId(order.quoteAssetId);

    this.orderType = order.order_type;
    this.assetType = order.asset_type;

    this.price = new BN(order.price);

    this.initialAmount = new BN(order.initial_amount);
    this.initialQuoteAmount = this.getQuoteAmount(this.initialAmount, this.price);

    this.currentAmount = new BN(order.amount);
    this.currentQuoteAmount = this.getQuoteAmount(this.currentAmount, this.price);

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

  get initialQuoteAmountUnits(): BN {
    return BN.formatUnits(this.initialQuoteAmount, this.quoteToken.decimals);
  }

  get currentQuoteAmountUnits(): BN {
    return BN.formatUnits(this.currentQuoteAmount, this.quoteToken.decimals);
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
    return this.initialAmount.minus(this.currentAmount).dividedBy(1e8).toSignificant(2);
  }

  addInitialAmount = (amount: BN) => {
    this.initialAmount = this.initialAmount.plus(amount);
    this.initialQuoteAmount = this.getQuoteAmount(this.initialAmount, this.price);
  };

  addCurrentAmount = (amount: BN) => {
    this.currentAmount = this.currentAmount.plus(amount);
    this.currentQuoteAmount = this.getQuoteAmount(this.currentAmount, this.price);
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
