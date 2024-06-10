// import { OrderbookContracts } from "@compolabs/spark-orderbook-ts-sdk/dist/interface";

import { ReactComponent as FuelWalletIcon } from "@src/assets/wallets/fuel.svg";
import { ReactComponent as FueletWalletIcon } from "@src/assets/wallets/fuelet.svg";
import TOKEN_LOGOS from "@src/constants/tokenLogos";
import { Token } from "@src/entity/Token";
import { AppWallet } from "@src/stores/SettingsStore";

import TOKENS_JSON from "./tokens.json";

export const CONTRACT_ADDRESSES: any = {
  spotMarket: "0x4a2ce054e3e94155f7092f7365b212f7f45105b74819c623744ebcc5d065c6ac",
  tokenFactory: "0x3141a3f11e3f784364d57860e3a4dcf9b73d42e23fd49038773cefb09c633348",
  pyth: "0x3cd5005f23321c8ae0ccfa98fb07d9a5ff325c483f21d2d9540d6897007600c9",
};
export interface Network {
  name: string;
  url: string;
}

export const NETWORKS: Network[] = [
  {
    name: "Fuel",
    url: "https://testnet.fuel.network/v1/graphql",
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

export const INDEXER_URL = "https://indexer.bigdevenergy.link/67b693c/v1/graphql";
// export const INDEXER_URL = "http://13.49.144.58:8080/v1/graphql";

export const PYTH_URL = "https://hermes.pyth.network";

interface Wallet {
  name: AppWallet;
  icon: React.FC;
  isActive: boolean;
  url: string;
}

export const WALLETS: Wallet[] = [
  {
    name: "Fuel Wallet",
    isActive: true,
    icon: FuelWalletIcon,
    url: "https://wallet.fuel.network/docs/install/",
  },
  {
    name: "Fuelet Wallet",
    isActive: true,
    icon: FueletWalletIcon,
    url: "https://fuelet.app/",
  },
];
