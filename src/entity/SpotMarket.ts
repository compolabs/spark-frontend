import { makeAutoObservable } from "mobx";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";

import { FuelNetwork } from "@blockchain";

import { Token } from "./Token";

export class SpotMarket {
  readonly baseToken: Token;
  readonly quoteToken: Token;
  readonly contractAddress: string;

  price: BN = BN.ZERO;
  setPrice = (price: BN) => (this.price = price);

  constructor(baseToken: string, quoteToken: string, contractAddress: string) {
    const bcNetwork = FuelNetwork.getInstance();

    this.baseToken = bcNetwork.getTokenByAssetId(baseToken);
    this.quoteToken = bcNetwork.getTokenByAssetId(quoteToken);
    this.contractAddress = contractAddress;

    makeAutoObservable(this);
  }

  get symbol(): string {
    return `${this.baseToken.symbol}-${this.quoteToken.symbol}`;
  }

  get priceUnits(): BN {
    return BN.formatUnits(this.price, DEFAULT_DECIMALS);
  }
}
