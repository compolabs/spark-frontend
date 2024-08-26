import TOKEN_LOGOS from "@src/constants/tokenLogos";
import { Token } from "@src/entity";

interface ConfigToken {
  name: string;
  symbol: string;
  decimals: number;
  precision: number;
  assetId: string;
  priceFeed: string;
}

interface Market {
  marketName: string;
  owner: string;
  baseAssetId: string;
  baseAssetDecimals: number;
  quoteAssetId: string;
  quoteAssetDecimals: number;
  priceDecimals: number;
  feeAssetId: string;
  contractId: string;
}

interface Indexer {
  httpUrl: string;
  wsUrl: string;
}

interface Contracts {
  orderbook: string;
  multiAsset: string;
}

interface Config {
  version: string;
  contractVer: number;
  tokens: ConfigToken[];
  markets: Market[];
  indexers: Record<string, Indexer>;
  contracts: Contracts;
  networkUrl: string;
  explorerUrl: string;
}

export class CONFIG {
  static APP: Config;
  static TOKENS: Token[];
  static TOKENS_BY_SYMBOL: Record<string, Token>;
  static TOKENS_BY_ASSET_ID: Record<string, Token>;

  constructor() {
    this.init();
  }

  private requestConfig = () => {
    // const response = await fetch("/config.json");
    // const data: Config = await response.json();

    // Fast solution for now
    return {
      version: "1.0.0",
      contractVer: 257,
      tokens: [
        {
          name: "Ethereum",
          symbol: "ETH",
          decimals: 9,
          assetId: "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07",
          priceFeed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
          precision: 9,
        },
        {
          name: "Bitcoin",
          symbol: "BTC",
          decimals: 8,
          assetId: "0x38e4ca985b22625fff93205e997bfc5cc8453a953da638ad297ca60a9f2600bc",
          priceFeed: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
          precision: 8,
        },
        {
          name: "USDC",
          symbol: "USDC",
          decimals: 6,
          assetId: "0x336b7c06352a4b736ff6f688ba6885788b3df16e136e95310ade51aa32dc6f05",
          priceFeed: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
          precision: 2,
        },
      ],
      markets: [
        {
          marketName: "BTCUSDC",
          owner: "0xf47e0ef744ac8c993550e03d17f1c4844494553a12cac11ab8c568c8999fdbbf",
          baseAssetId: "0x38e4ca985b22625fff93205e997bfc5cc8453a953da638ad297ca60a9f2600bc",
          baseAssetDecimals: 8,
          quoteAssetId: "0x336b7c06352a4b736ff6f688ba6885788b3df16e136e95310ade51aa32dc6f05",
          quoteAssetDecimals: 6,
          priceDecimals: 9,
          feeAssetId: "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07",
          contractId: "0x58959d086d8a6ee8cf8eeb572b111edb21661266be4b4885383748d11b72d0aa",
        },
      ],
      indexers: {
        "0x58959d086d8a6ee8cf8eeb572b111edb21661266be4b4885383748d11b72d0aa": {
          httpUrl: "https://indexer.bigdevenergy.link/c940d97/v1/graphql",
          wsUrl: "wss://indexer.bigdevenergy.link/c940d97/v1/graphql",
        },
      },
      contracts: {
        orderbook: "0x0713334e61ed73ba9421a3a49891953f9ccb7353828566b569752a82a39803e8",
        multiAsset: "0xdc527289bdef8ec452f350c9b2d36d464a9ebed88eb389615e512a78e26e3509",
      },
      networkUrl: "https://testnet.fuel.network/v1/graphql",
      explorerUrl: "https://app.fuel.network",
    };
  };

  public init() {
    const data = this.requestConfig();

    CONFIG.APP = data;
    CONFIG.TOKENS = data.tokens.map(({ name, symbol, decimals, assetId, priceFeed, precision }) => {
      return new Token({
        name,
        symbol,
        decimals,
        assetId,
        logo: TOKEN_LOGOS[symbol],
        priceFeed,
        precision,
      });
    });
    CONFIG.TOKENS_BY_SYMBOL = CONFIG.TOKENS.reduce((acc, t) => ({ ...acc, [t.symbol]: t }), {});
    CONFIG.TOKENS_BY_ASSET_ID = CONFIG.TOKENS.reduce((acc, t) => ({ ...acc, [t.assetId.toLowerCase()]: t }), {});

    return CONFIG;
  }
}

new CONFIG();
