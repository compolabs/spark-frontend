import { makeAutoObservable } from "mobx";

import { BN } from "@compolabs/spark-orderbook-ts-sdk";

import { DEFAULT_DECIMALS } from "@constants";
import { Market } from "@utils/getConfig";

import { FuelNetwork } from "@blockchain";

import { Token } from "./Token";

export class SpotMarket {
  readonly baseToken: Token;
  readonly quoteToken: Token;
  readonly contractAddress: string;
  readonly precision: number;

  price: BN = BN.ZERO;
  setPrice = (price: BN) => (this.price = price);

  constructor(market: Market) {
    const bcNetwork = FuelNetwork.getInstance();

    this.baseToken = bcNetwork.getTokenByAssetId(market.baseAssetId);
    this.quoteToken = bcNetwork.getTokenByAssetId(market.quoteAssetId);
    this.contractAddress = market.contractId;
    this.precision = market.precision;

    makeAutoObservable(this);
  }

  get symbol(): string {
    return `${this.baseToken.symbol}-${this.quoteToken.symbol}`;
  }

  get priceUnits(): BN {
    return BN.formatUnits(this.price, DEFAULT_DECIMALS);
  }
}
