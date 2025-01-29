import { makeAutoObservable } from "mobx";

import { CONFIG } from "@utils/getConfig.ts";

import { FuelNetwork } from "@blockchain";

import BN from "../utils/BN";

import { Token } from "./Token";

interface PerpPositionParams {
  baseToken: string;
  market: string;
  lastTwPremiumGrowthGlobal: BN;
  takerOpenNotional: BN;
  takerPositionSize: BN;
  imRatio: BN;
  markPrice: BN;
}

export class PerpPosition {
  readonly baseToken: Token;
  readonly quoteToken: Token;
  readonly lastTwPremiumGrowthGlobal: BN;
  readonly takerOpenNotional: BN;
  readonly takerPositionSize: BN;
  readonly imRatio: BN;
  readonly _markPrice: BN;
  readonly side: string;

  _pendingFundingPayment = BN.ZERO;
  setPendingFundingPayment = (payment: BN) => (this._pendingFundingPayment = payment);

  constructor(params: PerpPositionParams) {
    const bcNetwork = FuelNetwork.getInstance();
    const findMarket = CONFIG.PERP.MARKETS.find((el) => el.contractId === params.market) ?? CONFIG.PERP.MARKETS[0];

    this.baseToken = bcNetwork.getTokenByAssetId(findMarket?.baseAssetId);
    this.quoteToken = bcNetwork.getTokenByAssetId(findMarket?.quoteAssetId);

    this.lastTwPremiumGrowthGlobal = params.lastTwPremiumGrowthGlobal;
    this.takerOpenNotional = new BN(params.takerOpenNotional).abs();
    this.takerPositionSize = new BN(params.takerPositionSize);

    this.imRatio = new BN(params.imRatio);
    this.side = new BN(params.takerOpenNotional).isGreaterThan(0) ? "long" : "short";
    this._markPrice = new BN(params.markPrice);
    makeAutoObservable(this);
  }

  get symbol(): string {
    return `${this.baseToken.symbol}-PERP`;
  }

  get entrySizeValue() {
    return BN.formatUnits(this.takerPositionSize.multipliedBy(this.markPrice), this.baseToken.decimals);
  }

  get formatSizeValue() {
    return BN.formatUnits(this.takerPositionSize, this.baseToken.decimals);
  }

  get markPrice() {
    return BN.formatUnits(this._markPrice, this.quoteToken.decimals);
  }

  get pendingFundingPayment() {
    return BN.formatUnits(this._pendingFundingPayment, this.quoteToken.decimals);
  }

  get margin() {
    return this.entrySizeValue.multipliedBy(BN.formatUnits(this.imRatio, this.baseToken.decimals)).toSignificant(4);
  }

  get type() {
    return this.takerPositionSize.isPositive() ? "Long" : "Short";
  }

  get entryPrice() {
    const openNotional = BN.formatUnits(this.takerPositionSize, this.baseToken.decimals);

    return this.entrySizeValue.div(openNotional);
  }

  get unrealizedPnl() {
    const openPosition = BN.formatUnits(this.takerPositionSize, this.quoteToken.decimals);
    if (this.side === "long") {
      return this.markPrice.minus(this.entryPrice).multipliedBy(openPosition);
    } else {
      return this.entryPrice.minus(this.markPrice).multipliedBy(openPosition);
    }
  }

  get unrealizedPnlPercent() {
    const openPosition = BN.formatUnits(this.takerPositionSize, this.quoteToken.decimals);
    const pnl = this.unrealizedPnl;
    return pnl.dividedBy(this.entryPrice.multipliedBy(openPosition)).multipliedBy(100);
  }

  get isUnrealizedPnlInProfit() {
    return this.unrealizedPnl.isPositive();
  }

  get leverage() {
    return "20";
  }
}
