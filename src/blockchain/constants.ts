// import { OrderbookContracts } from "@compolabs/spark-orderbook-ts-sdk/dist/interface";
// TODO: add types from sdk after fixed export

import TOKEN_LOGOS from "@src/constants/tokenLogos";
import { Token } from "@src/entity/Token";

import TOKENS_JSON from "./tokens.json";

export const CONTRACT_ADDRESSES = {
  market: "0x08ca18ed550d6229f001641d43aac58e00f9eb7e25c9bea6d33716af61e43b2a",
  tokenFactory: "0x3141a3f11e3f784364d57860e3a4dcf9b73d42e23fd49038773cefb09c633348",
  pyth: "0x3cd5005f23321c8ae0ccfa98fb07d9a5ff325c483f21d2d9540d6897007600c9",
};
export interface Network {
  name: string;
  url: string;
}

export const NETWORK: Network = {
  name: "Fuel",
  url: "https://beta-5.fuel.network/graphql",
};

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

export const INDEXER_URL = "https://indexer.bigdevenergy.link/67b693c/v1/graphql";
// export const INDEXER_URL = "http://localhost:8080/v1/graphql";
// export const INDEXER_URL = "https://envio-orderbook-indexer.spark-defi.com/v1/graphql";
export const PYTH_URL = "https://hermes.pyth.network";
