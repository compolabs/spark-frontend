import assert from "assert";

import TOKEN_LOGOS from "@constants/tokenLogos";

import { Token } from "@entity";

import configProdJSON from "@src/config.json";
import configDevJSON from "@src/config-dev.json";

export interface Market {
  marketName: string;
  owner: string;
  baseAssetId: string;
  baseAssetDecimals: number;
  quoteAssetId: string;
  quoteAssetDecimals: number;
  priceDecimals: number;
  version: number;
  contractId: string;
}

function createConfig() {
  const CURRENT_CONFIG_VER = import.meta.env.DEV ? "2.0.0" : "2.0.0";
  const configJSON = import.meta.env.DEV ? configDevJSON : configProdJSON;
  assert(configJSON.version === CURRENT_CONFIG_VER, "Version mismatch");

  console.warn("V12 CONFIG", configJSON);

  const tokens = configJSON.tokens.map(({ name, symbol, decimals, assetId, priceFeed, precision, collateral }) => {
    return new Token({
      name,
      symbol,
      decimals,
      assetId,
      logo: TOKEN_LOGOS[symbol],
      priceFeed,
      precision,
      collateral,
    });
  });

  const tokensBySymbol = tokens.reduce(
    (acc, t) => {
      acc[t.symbol] = t;

      return acc;
    },
    {} as Record<string, Token>,
  );
  const tokensByAssetId = tokens.reduce(
    (acc, t) => ({ ...acc, [t.assetId.toLowerCase()]: t }),
    {} as Record<string, Token>,
  );

  return {
    APP: configJSON,
    SPOT: {
      MARKETS: configJSON.spot.markets as Market[],
      CONTRACTS: configDevJSON.spot.contracts,
      INDEXERS: configDevJSON.spot.indexers,
    },
    PERP: {
      MARKETS: configJSON.perp.markets as Market[],
      CONTRACTS: configDevJSON.perp.contracts,
      INDEXERS: configDevJSON.perp.indexers,
    },
    TOKENS: tokens,
    TOKENS_BY_SYMBOL: tokensBySymbol,
    TOKENS_BY_ASSET_ID: tokensByAssetId,
  };
}

export const CONFIG = createConfig();
