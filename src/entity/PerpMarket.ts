import { makeAutoObservable } from "mobx";

import { Blockchain } from "@blockchain";
import { BN } from "@blockchain/fuel/types";

import { DEFAULT_DECIMALS } from "../constants";

import { Token } from "./Token";

interface PerpMarketParams {
  baseTokenAddress: string;
  quoteTokenAddress: string;
  imRatio: BN;
  mmRatio: BN;
  status: "Opened" | "Paused" | "Closed";
  pausedIndexPrice?: BN;
  pausedTimestamp?: number;
  closedPrice?: BN;
  contractAddress: string;
}

export class PerpMarket {
  readonly baseToken: Token;
  readonly quoteToken: Token;
  readonly contractAddress: string;

  readonly imRatio: BN;
  readonly mmRatio: BN;
  readonly status: "Opened" | "Paused" | "Closed";
  readonly pausedIndexPrice?: BN;
  readonly pausedTimestamp?: number;
  readonly closedPrice?: BN;

  price: BN = BN.ZERO;
  setPrice = (price: BN) => (this.price = price);

  constructor(params: PerpMarketParams) {
    const bcNetwork = Blockchain.getInstance();

    this.baseToken = bcNetwork.sdk.getTokenByAssetId(params.baseTokenAddress);
    this.quoteToken = bcNetwork.sdk.getTokenByAssetId(params.quoteTokenAddress);

    this.imRatio = params.imRatio;
    this.mmRatio = params.mmRatio;
    this.status = params.status;
    this.pausedIndexPrice = params.pausedIndexPrice;
    this.pausedTimestamp = params.pausedTimestamp;
    this.closedPrice = params.closedPrice;
    this.contractAddress = params.contractAddress;

    makeAutoObservable(this);
  }

  get symbol(): string {
    return `${this.baseToken.symbol}-PERP`;
  }

  get priceUnits(): BN {
    return BN.formatUnits(this.price, DEFAULT_DECIMALS);
  }
}
