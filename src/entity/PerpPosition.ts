import { makeAutoObservable } from "mobx";

import { FuelNetwork } from "@blockchain";

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

  private _markPrice = BN.ZERO;
  setMarkPrice = (price: BN) => (this._markPrice = price);

  private _imRatio = BN.ZERO;
  setImRatio = (ratio: BN) => (this._imRatio = ratio);

  _pendingFundingPayment = BN.ZERO;
  setPendingFundingPayment = (payment: BN) => (this._pendingFundingPayment = payment);

  constructor(params: PerpPositionParams) {
    const bcNetwork = FuelNetwork.getInstance();

    this.baseToken = bcNetwork.getTokenByAssetId(params.baseTokenAddress);
    this.quoteToken = bcNetwork.getTokenBySymbol("USDC");

    this.lastTwPremiumGrowthGlobal = params.lastTwPremiumGrowthGlobal;
    this.takerOpenNational = BN.formatUnits(params.takerOpenNational, this.baseToken.decimals);
    this.takerPositionSize = BN.formatUnits(params.takerPositionSize, this.baseToken.decimals);

    makeAutoObservable(this);
  }

  get symbol(): string {
    return `${this.baseToken.symbol}-PERP`;
  }

  get entrySizeValue() {
    return this.takerPositionSize.multipliedBy(this.markPrice);
  }

  get markPrice() {
    return BN.formatUnits(this._markPrice, this.quoteToken.decimals);
  }

  get imRatio() {
    return BN.formatUnits(this._imRatio, this.quoteToken.decimals);
  }

  get pendingFundingPayment() {
    return BN.formatUnits(this._pendingFundingPayment, this.quoteToken.decimals);
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
    return this.takerPositionSize.multipliedBy(this.markPrice).plus(this.takerOpenNational);
  }

  get unrealizedPnlPercent() {
    return this.takerPositionSize.multipliedBy(this.markPrice).dividedBy(this.takerOpenNational).minus(1);
  }

  get isUnrealizedPnlInProfit() {
    return this.takerOpenNational.multipliedBy(this.takerPositionSize).multipliedBy(this.markPrice).isPositive();
  }
}
