import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";

import { FuelNetwork } from "@blockchain";

import { Token } from "./Token";

export interface BaseMarketParams {
  baseTokenAddress: string;
  quoteTokenAddress: string;
  contractAddress: string;
}

export abstract class BaseMarket {
  abstract type: "perp" | "spot";
  abstract get symbol(): string;

  readonly baseToken: Token;
  readonly quoteToken: Token;
  readonly contractAddress: string;

  price: BN = BN.ZERO;

  constructor(params: BaseMarketParams) {
    const bcNetwork = FuelNetwork.getInstance();

    this.baseToken = bcNetwork.getTokenByAssetId(params.baseTokenAddress);
    this.quoteToken = bcNetwork.getTokenByAssetId(params.quoteTokenAddress);
    this.contractAddress = params.contractAddress;
  }

  setPrice(price: BN) {
    this.price = price;
  }

  get priceUnits(): BN {
    return BN.formatUnits(this.price, DEFAULT_DECIMALS);
  }
}
