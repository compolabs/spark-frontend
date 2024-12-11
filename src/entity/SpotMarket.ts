import { BaseMarket, BaseMarketParams } from "./BaseMarket";

export class SpotMarket extends BaseMarket {
  readonly type = "spot" as const;

  constructor(params: BaseMarketParams) {
    super(params);
  }

  get symbol(): string {
    return `${this.baseToken.symbol}-${this.quoteToken.symbol}`;
  }

  static isInstance(market: BaseMarket): market is SpotMarket {
    return market.type === "spot";
  }
}
