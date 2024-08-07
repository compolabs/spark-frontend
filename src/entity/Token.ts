interface TokenParams {
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
  assetId: string;
  priceFeed: string;
  precision: number;
}

export class Token {
  public readonly name: TokenParams["name"];
  public readonly symbol: TokenParams["symbol"];
  public readonly decimals: TokenParams["decimals"];
  public readonly logo: TokenParams["logo"];
  public readonly assetId: TokenParams["assetId"];
  public readonly priceFeed: TokenParams["priceFeed"];
  public readonly precision: TokenParams["precision"];

  constructor(params: TokenParams) {
    this.name = params.name;
    this.symbol = params.symbol;
    this.decimals = params.decimals;
    this.logo = params.logo;
    this.assetId = params.assetId;
    this.priceFeed = params.priceFeed;
    this.precision = params.precision;
  }
}
