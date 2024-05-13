import { Contracts } from "src/interface";

export const DEFAULT_DECIMALS = 9;

export const DEFAULT_GAS_PRICE = "1";
export const DEFAULT_GAS_LIMIT_MULTIPLIER = "2";

type FuelAddress = `fuel${string}`;
type EthereumAddress = `0x${string}`;

type ContractAddress = {
  base: EthereumAddress;
  fuel: FuelAddress;
};

export const BETA_CONTRACT_ADDRESSES: Contracts = {
  spotMarket:
    "0x0f0c1065a7b82d026069c5cf070b21ee65713fd1ac92ec1d25eacc3100187f78",
  tokenFactory:
    "0x6bd9643c9279204b474a778dea7f923226060cb94a4c61c5aae015cf96b5aad2",
  pyth: "0x3cd5005f23321c8ae0ccfa98fb07d9a5ff325c483f21d2d9540d6897007600c9",
  vault: "0x04bfef4abff72e0b8b8b96f3a89beacfa4e280a0944f74adaba34f74b9af0bd3",
  accountBalance:
    "0x798dce97aaa21bde82cf55459d14c828238394c80ae4ea444d20667baba83dd7",
  clearingHouse:
    "0xfe244b38e8783290538dd2f9de7461013a0436c69a6d193f8d2fba270e9e1655",
  perpMarket:
    "0xfb8dc15d38f47c62f7b15724e3e22645435d6314cc51a5c0fc49896da3f0a397",
  proxy: "0x5db3efcefe7c0f22566a78088fe29d6d6de73b667da0abe9e3b6e7a7d6bd458d",
  insuranceFund:
    "0x9cb2e31a5e1ed73da81e2523d4935104c971b0a920a75d2ae6b7f2cc5ffbfb43",
};

export const EXPLORER_URL = "https://app.fuel.network/";

export const BETA_NETWORK = {
  name: "Fuel",
  url: "https://beta-5.fuel.network/graphql",
};

export const BETA_INDEXER_URL = "https://indexer.spark-defi.com";
