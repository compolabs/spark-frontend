import TOKEN_LOGOS from "@src/constants/tokenLogos";
import { Token } from "@src/entity/Token";

import TOKENS_JSON from "./tokens.json";

const CONTRACT_ADDRESSES_MARKET = import.meta.env.VITE_CONTRACT_ADDRESSES_MARKET;
const CONTRACT_ADDRESSES_TOEKN_FACTORY = import.meta.env.VITE_CONTRACT_ADDRESSES_TOEKN_FACTORY;
const CONTRACT_ADDRESSES_PYTH = import.meta.env.VITE_CONTRACT_ADDRESSES_PYTH
const INDEXER_URL = import.meta.env.VITE_INDEXER_URL

export const CONTRACT_ADDRESSES = {
  market: CONTRACT_ADDRESSES_MARKET,
  tokenFactory: CONTRACT_ADDRESSES_TOEKN_FACTORY,
  pyth: CONTRACT_ADDRESSES_PYTH,
};
export interface Network {
  name: string;
  url: string;
}

export const NETWORK: Network = {
  name: "Fuel",
  url: "https://testnet.fuel.network/v1/graphql",
};

export const EXPLORER_URL = "https://app.fuel.network/";

export const TOKENS_LIST: Token[] = Object.values(TOKENS_JSON).map(
  ({ name, symbol, decimals, assetId, priceFeed, precision }) => {
    return new Token({
      name,
      symbol,
      decimals,
      assetId,
      logo: TOKEN_LOGOS[symbol],
      priceFeed,
      precision,
    });
  },
);

export const TOKENS_BY_SYMBOL: Record<string, Token> = TOKENS_LIST.reduce((acc, t) => ({ ...acc, [t.symbol]: t }), {});

export const TOKENS_BY_ASSET_ID: Record<string, Token> = TOKENS_LIST.reduce(
  (acc, t) => ({ ...acc, [t.assetId.toLowerCase()]: t }),
  {},
);

const URL = INDEXER_URL;

export const INDEXER_HTTP_URL = `https://${URL}/v1/graphql`;
export const INDEXER_WS_URL = `wss://${URL}/v1/graphql`;
export const PYTH_URL = "https://hermes.pyth.network";
