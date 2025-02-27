import {
  BakoSafeConnector,
  FueletWalletConnector,
  FuelWalletConnector,
  SolanaConnector,
  WalletConnectConnector,
} from "@fuels/connectors";
// import { InjectedParameters } from "@wagmi/core";
// import { WalletConnectConnector } from "@wagmi/core/connectors/walletConnect";
// import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

export const ROUTES = {
  ROOT: "/",
  SPOT: "/spot",
  FAUCET: "/faucet",
  SWAP: "/swap",
  DASHBOARD: "/dashboard",
  LEADERBOARD: "/leaderboard",
  COMPETITIONS: "/competitions",
  STATS: "/stats",
};

export const BRIDGE_LINK = "https://app.fuel.network/bridge";
export const SWAP_LINK = "https://layerswap.io/app";
export const POINTS_LINK = "https://fuel.mirror.xyz/WbftLFQtWPaMZsQIgB-hMCPuma6iFjWgKGiu1DONUI4";
export const isProduction = window.location.host === "app.sprk.fi";

export const ARBITRUM_SEPOLIA_FAUCET = "https://faucet.quicknode.com/arbitrum/sepolia";
export const FUEL_FAUCET = "https://faucet-testnet.fuel.network";
export const TV_DATAFEED = "https://spark-tv-datafeed.spark-defi.com/api/v1";
export const CHARTS_STORAGE = "https://tv-backend-v4.herokuapp.com/";
export const WALLET_DOCS_LINK = "https://docs.v12.trade/trade/getting-started-as-a-trader/wallet-setup";
export const FUELET_APP_LINK = "https://fuelet.app";

export const DEFAULT_DECIMALS = 9;

export const TWITTER_LINK = "https://x.com/v12trade";
export const GITHUB_LINK = "https://github.com/compolabs";
export const DOCS_LINK = "https://docs.sprk.fi";
export const FUEL_LINK = "https://fuel.network";
export const DISCORD_LINK = "https://t.co/EfXHTEhXHc";

export const PYTH_LINK = "https://www.pyth.network/";
export const EVENTS = {
  OpenSideAssets: "openSideAssets",
};

export const DEFAULT_MARKET = "BTC-USDC";

export const MINIMAL_ETH_REQUIRED = 25000; // 0.000025

const WC_PROJECT_ID = "cf4ad9eca02fdf75b8c6ef0b687ddd16";

// const METADATA = {
//   name: "V12",
//   description: "V12 is the fastest onchain order book based on Fuel Network",
//   url: location.href,
//   icons: ["https://app.sprk.fi/pwa-192x192.png"],
// };

export const FUEL_CONFIG = {
  // connectors: defaultConnectors({
  //   devMode: import.meta.env.DEV,
  //   wcProjectId: WC_PROJECT_ID,
  // }),
  connectors: [
    new FuelWalletConnector(),
    new FueletWalletConnector(),
    new BakoSafeConnector(),
    new WalletConnectConnector({ projectId: WC_PROJECT_ID }),
    new SolanaConnector({ projectId: WC_PROJECT_ID }),
  ],
};
