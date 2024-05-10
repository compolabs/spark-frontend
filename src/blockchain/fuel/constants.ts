import { BetaContractAddresses } from "@compolabs/spark-ts-sdk/dist/constants";

import TOKEN_LOGOS from "@src/constants/tokenLogos";
import { Token } from "@src/entity/Token";

import TOKENS_JSON from "./tokens.json";

export const CONTRACT_ADDRESSES: BetaContractAddresses = {
  spotMarket: {
    base: "0x0f0c1065a7b82d026069c5cf070b21ee65713fd1ac92ec1d25eacc3100187f78",
    fuel: "fuel",
  },
  tokenFactory: {
    base: "0x6bd9643c9279204b474a778dea7f923226060cb94a4c61c5aae015cf96b5aad2",
    fuel: "fuel",
  },
  pyth: {
    base: "0x3cd5005f23321c8ae0ccfa98fb07d9a5ff325c483f21d2d9540d6897007600c9",
    fuel: "fuel",
  },
  vault: {
    base: "0xb3183fce01719581d51b2e2728d48c41487587de467658c0b2b771da12f453da",
    fuel: "fuel1kvvrlnspwx2cr4gm9cnj34yvg9y8tp77gem93s9jkaca5yh520dqn04uzy",
  },
  accountBalance: {
    base: "0xbc2e353b4abce76a21f517142e50d9f1eb3d0d0685e1288574110141853d483d",
    fuel: "fuel1hshr2w62hnnk5g04zu2zu5xe784n6rgxshsj3pt5zyq5rpfafq7sxh02eh",
  },
  clearingHouse: {
    base: "0x3ae5b110c319fdbf9e8fe59f7fd60e84b2b01725b1f63270927c4aa8f279a7ce",
    fuel: "fuel18tjmzyxrr87ml850uk0hl4swsjetq9e9k8mryuyj03923une5l8q0dm42s",
  },
  perpMarket: {
    base: "0x8f49a91675443bb1a90e91d5c04c07d3e7fe38afaf9167e2cee616ef0b566096",
    fuel: "fuel13ay6j9n4gsamr2gwj82uqnq860nluw9047gk0ckwuctw7z6kvztq9yehr3",
  },
  proxy: {
    base: "0xb8f0f15983383f478600cd17bfacb4ab246f04e071151f29a31a594841d04d56",
    fuel: "fuel1hrc0zkvr8ql50psqe5tmlt954vjx7p8qwy2372drrfv5sswsf4tqc6frwe",
  },
  insuranceFund: {
    base: "0x07e9b371baeb21697ba2f8aa5032466f2b76341b60a10c0bbacb8a1bda2f5af5",
    fuel: "fuel1ql5mxud6avskj7azlz49qvjxdu4hvdqmvzsscza6ew9phk30tt6s2mvec2",
  },
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

export const PYTH_URL = "https://hermes.pyth.network";
