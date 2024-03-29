import { makeAutoObservable } from "mobx";

import { BlockchainNetworkFactory } from "../blockchain/BlockchainNetworkFactory";
import BN from "../utils/BN";

import { Token } from "./Token";

interface PerpPositionParams {
  baseTokenAddress: string;
  lastTwPremiumGrowthGlobal: BN;
  takerOpenNational: BN;
  takerPositionSize: BN;
}

export class PerpPosition {
  readonly baseToken: Token;
  readonly quoteToken: Token;
  readonly lastTwPremiumGrowthGlobal: BN;
  readonly takerOpenNational: BN;
  readonly takerPositionSize: BN;

  markPrice = BN.ZERO;
  setMarkPrice = (price: BN) => (this.markPrice = price);

  imRatio = BN.ZERO;
  setImRatio = (ratio: BN) => (this.imRatio = ratio);

  pendingFundingPayment = BN.ZERO;
  setPendingFundingPayment = (payment: BN) => (this.pendingFundingPayment = payment);

  constructor(params: PerpPositionParams) {
    const bcNetwork = BlockchainNetworkFactory.getInstance().currentInstance!;

    this.baseToken = bcNetwork.getTokenByAssetId(params.baseTokenAddress);
    this.quoteToken = bcNetwork.getTokenBySymbol("USDC");

    this.lastTwPremiumGrowthGlobal = params.lastTwPremiumGrowthGlobal;
    this.takerOpenNational = params.takerOpenNational;
    this.takerPositionSize = params.takerPositionSize;

    makeAutoObservable(this);
  }

  get symbol(): string {
    return `${this.baseToken.symbol}-PERP`;
  }

  get entrySizeValue() {
    return this.takerPositionSize.multipliedBy(this.markPrice);
  }

  get margin() {
    return this.entrySizeValue.multipliedBy(this.imRatio);
  }

  get type() {
    return this.takerPositionSize.isPositive() ? "Long" : "Short";
  }

  get entryPrice() {
    return this.takerOpenNational.div(this.takerPositionSize);
  }

  get unrealizedPnl() {
    return this.takerOpenNational.multipliedBy(this.takerPositionSize).multipliedBy(this.markPrice);
  }

  get unrealizedPnlPercent() {
    return this.takerPositionSize.multipliedBy(this.markPrice).dividedBy(this.takerOpenNational).minus(1);
  }

  get isUnrealizedPnlInProfit() {
    return this.takerOpenNational.multipliedBy(this.takerPositionSize).multipliedBy(this.markPrice).isPositive();
  }
}
