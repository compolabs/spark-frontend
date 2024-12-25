import { Config } from "react-popper-tooltip";
import { BakoSafeConnector, FueletWalletConnector, FuelWalletConnector } from "@fuels/connectors";

import tableLargeSize from "@assets/icons/tableLargeSize.svg";
import tableMediumSize from "@assets/icons/tableMediumSize.svg";
import tableSizeExtraSmall from "@assets/icons/tableSizeExtraSmall.svg";
import tableSmallSize from "@assets/icons/tableSmallSize.svg";

import { TRADE_TABLE_SIZE } from "@stores/SettingsStore";

export const ROUTES = {
  ROOT: "/",
  SPOT: "/spot",
  PERP: "/perp",
  FAUCET: "/faucet",
  SWAP: "/swap",
  DASHBOARD: "/dashboard",
  LEADERBOARD: "/leaderboard",
};

export const BRIDGE_LINK = "https://app.fuel.network/bridge";
export const SWAP_LINK = "https://layerswap.io/app";
export const POINTS_LINK = "https://app.fuel.network/earn-points/phase-2/";
export const isProduction = window.location.host === "app.sprk.fi";

export const ARBITRUM_SEPOLIA_FAUCET = "https://faucet.quicknode.com/arbitrum/sepolia";
export const FUEL_FAUCET = "https://faucet-testnet.fuel.network";
export const TV_DATAFEED = "https://spark-tv-datafeed.spark-defi.com/api/v1";
export const CHARTS_STORAGE = "https://tv-backend-v4.herokuapp.com/";

export const DEFAULT_DECIMALS = 9;

export const TWITTER_LINK = "https://twitter.com/Sprkfi";
export const GITHUB_LINK = "https://github.com/compolabs";
export const DOCS_LINK = "https://docs.sprk.fi";
export const FUEL_LINK = "https://fuel.network";
export const DISCORD_LINK = "https://t.co/EfXHTEhXHc";

export const EVENTS = {
  OpenSideAssets: "openSideAssets",
};

export const DEFAULT_MARKET = "BTC-USDC";

export const MINIMAL_ETH_REQUIRED = 25000; // 0.000025

// const WC_PROJECT_ID = "cf4ad9eca02fdf75b8c6ef0b687ddd16";

// const METADATA = {
//   name: "Spark",
//   description: "Spark is the fastest onchain order book based on Fuel Network",
//   url: location.href,
//   icons: ["https://app.sprk.fi/pwa-192x192.png"],
// };

export const FUEL_CONFIG = {
  // connectors: defaultConnectors({
  //   devMode: import.meta.env.DEV,
  //   wcProjectId: WC_PROJECT_ID,
  // }),
  connectors: [new FuelWalletConnector(), new FueletWalletConnector(), new BakoSafeConnector()],
};

export const MAX_TABLE_HEIGHT = {
  [TRADE_TABLE_SIZE.XS]: "120px",
  [TRADE_TABLE_SIZE.S]: "197px",
  [TRADE_TABLE_SIZE.M]: "263px",
  [TRADE_TABLE_SIZE.L]: "395px",
  [TRADE_TABLE_SIZE.AUTO]: "100%",
};

export const TABLE_SIZES_CONFIG = [
  { title: "Extra small", icon: tableSizeExtraSmall, size: TRADE_TABLE_SIZE.XS },
  { title: "Small", icon: tableSmallSize, size: TRADE_TABLE_SIZE.S },
  { title: "Medium", icon: tableMediumSize, size: TRADE_TABLE_SIZE.M },
  { title: "Large", icon: tableLargeSize, size: TRADE_TABLE_SIZE.L },
];

export const RESIZE_TOOLTIP_CONFIG: Config = { placement: "bottom-start", trigger: "click" };
