import { makeAutoObservable } from "mobx";

import { BN } from "@compolabs/spark-orderbook-ts-sdk";

import { DEFAULT_DECIMALS } from "@constants";
import { toCurrency } from "@utils/toCurrency";

import { FuelNetwork } from "@blockchain";

import { Token } from "./Token";

interface PerpOrderParams {
  id: string;
  baseSize: BN;
  baseTokenAddress: string;
  orderPrice: BN;
  trader: string;
}

export class PerpOrder {
  readonly baseToken: Token;
  readonly id: string;
  readonly baseSize: BN;
  readonly orderPrice: BN;
  readonly trader: string;

  constructor(params: PerpOrderParams) {
    const bcNetwork = FuelNetwork.getInstance();

    this.baseToken = bcNetwork.getTokenByAssetId(params.baseTokenAddress);

    this.id = params.id;
    this.baseSize = params.baseSize;
    this.orderPrice = params.orderPrice;
    this.trader = params.trader;

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
