import TOKEN_LOGOS from "@src/constants/tokenLogos";
import { Token } from "@src/entity/Token";

import TOKENS_JSON from "./tokens.json";

export const CONTRACT_ADDRESSES = {
  spotMarket: "0x0f0c1065a7b82d026069c5cf070b21ee65713fd1ac92ec1d25eacc3100187f78",
  tokenFactory: "0x6bd9643c9279204b474a778dea7f923226060cb94a4c61c5aae015cf96b5aad2",
  vault: "0x0030b0d258fb536aeb70d12409b6f3fde17541e3d02570cf53cd3f0944729a3d",
  accountBalance: "0xbd200b0e96f70737ed8f039ca81c45c1ec8ee75ede376f793c2d8c27ec592377",
  clearingHouse: "0xc8fb5aa5b1129d7f168571768d65a5b25f6451170397a13bb21896f111ca4633",
  perpMarket: "0x458255214c7d2b4a6c605317f8bf924fe0617ffc6a0c488693189adbf14441ff",
  pyth: "0x3cd5005f23321c8ae0ccfa98fb07d9a5ff325c483f21d2d9540d6897007600c9",
  proxy: "0x7f94d112735a20c0374501b1dd3dc83c624db84feb48c546e7698a6d95177b64",
};
export interface Network {
  name: string;
  url: string;
}

export const NETWORKS: Network[] = [
  {
    name: "Fuel",
    url: "https://beta-5.fuel.network/graphql",
  },
];

export const EXPLORER_URL = "https://app.fuel.network/";

export const TOKENS_LIST: Token[] = Object.values(TOKENS_JSON).map(({ name, symbol, decimals, assetId, priceFeed }) => {
  return new Token({
    name,
    symbol,
    decimals,
    assetId,
    logo: TOKEN_LOGOS[symbol],
    priceFeed,
  });
});

export const TOKENS_BY_SYMBOL: Record<string, Token> = TOKENS_LIST.reduce((acc, t) => ({ ...acc, [t.symbol]: t }), {});

export const TOKENS_BY_ASSET_ID: Record<string, Token> = TOKENS_LIST.reduce(
  (acc, t) => ({ ...acc, [t.assetId.toLowerCase()]: t }),
  {},
);

export const INDEXER_URL = "https://indexer.spark-defi.com";
