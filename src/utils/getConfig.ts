import assert from "assert";

import TOKEN_LOGOS from "@constants/tokenLogos";

import { Token } from "@entity";

import configJSON from "@src/config.json";

const CURRENT_CONFIG_VER = "1.2.0";

function createConfig() {
  assert(configJSON.version === CURRENT_CONFIG_VER, "Version mismatch");

  console.warn("SPARK CONFIG", configJSON);

  const tokens = configJSON.tokens.map(({ name, symbol, decimals, assetId, priceFeed, precision }) => {
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

  const tokensBySymbol = tokens.reduce((acc, t) => ({ ...acc, [t.symbol]: t }), {} as Record<string, Token>);
  const tokensByAssetId = tokens.reduce(
    (acc, t) => ({ ...acc, [t.assetId.toLowerCase()]: t }),
    {} as Record<string, Token>,
  );

  return {
    APP: configJSON,
    TOKENS: tokens,
    TOKENS_BY_SYMBOL: tokensBySymbol,
    TOKENS_BY_ASSET_ID: tokensByAssetId,
  };
}

export const CONFIG = createConfig();