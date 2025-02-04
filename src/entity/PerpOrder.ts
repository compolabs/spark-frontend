import { makeAutoObservable } from "mobx";

import { DEFAULT_DECIMALS } from "@constants";
import { toCurrency } from "@utils/toCurrency";

import { FuelNetwork } from "@blockchain";

import BN from "../utils/BN";

import { Token } from "./Token";

export interface PerpOrderParams {
  id: string;
  baseSize: BN;
  baseToken: string;
  orderPrice: BN;
  trader: string;
}

export class PerpOrder {
  readonly baseToken: Token;
  readonly quoteToken: Token | undefined;
  readonly id: string;
  readonly baseSize: BN;
  readonly orderPrice: BN;
  readonly trader: string;
  readonly price: BN | undefined;

  constructor(params: PerpOrderParams) {
    const bcNetwork = FuelNetwork.getInstance();
    this.baseToken = bcNetwork.getTokenByAssetId(params.baseToken);
    this.id = params.id;
    this.baseSize = params.baseSize;
    this.orderPrice = params.orderPrice;
    this.trader = params.trader;
    console.log("getValue");
    makeAutoObservable(this);
  }

  get symbol(): string {
    return `${this.baseToken.symbol}-PERP`;
  }

  get baseSizeFormatted(): string {
    return BN.formatUnits(this.baseSize, this.baseToken.decimals).toSignificant(2);
  }

  get baseSizeValueFormatted(): string {
    const valueInUsd = BN.formatUnits(this.baseSize, this.baseToken.decimals).multipliedBy(
      BN.formatUnits(this.orderPrice, DEFAULT_DECIMALS),
    );
    return toCurrency(valueInUsd.toSignificant(2));
  }

  get orderPriceFormatted(): string {
    return toCurrency(BN.formatUnits(this.orderPrice, DEFAULT_DECIMALS).toSignificant(2));
  }
}
