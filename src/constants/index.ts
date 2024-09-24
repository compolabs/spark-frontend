import { defaultConnectors } from "@fuels/connectors";
import { coinbaseWallet, walletConnect } from "@wagmi/connectors";
import { createConfig, http, injected } from "@wagmi/core";
import { sepolia } from "@wagmi/core/chains";

export const ROUTES = {
  ROOT: "/",
  SPOT: "/spot",
  FAUCET: "/faucet",
  SWAP: "/swap",
};

export const isProduction = window.location.host === "app.sprk.fi";

export const ARBITRUM_SEPOLIA_FAUCET = "https://faucet.quicknode.com/arbitrum/sepolia";
export const FUEL_FAUCET = "https://faucet-testnet.fuel.network";
export const TV_DATAFEED = "https://spark-tv-datafeed.spark-defi.com/api/v1";
export const CHARTS_STORAGE = "https://tv-backend-v4.herokuapp.com/";

export const DEFAULT_DECIMALS = 9;
export const USDC_DECIMALS = 6;

export const TWITTER_LINK = "https://twitter.com/Sprkfi";
export const GITHUB_LINK = "https://github.com/compolabs";
export const DOCS_LINK = "https://docs.sprk.fi";
export const FUEL_LINK = "https://fuel.network";

export const EVENTS = {
  OpenSideAssets: "openSideAssets",
};

export const DEFAULT_MARKET = "BTC-USDC";

export const MINIMAL_ETH_REQUIRED = 25000; // 0.000025

const WC_PROJECT_ID = "cf4ad9eca02fdf75b8c6ef0b687ddd16";

const METADATA = {
  name: "Spark",
  description: "Spark is the fastest onchain order book based on Fuel Network",
  url: location.href,
  icons: ["https://app.sprk.fi/pwa-192x192.png"],
};

const wagmiConfig = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  connectors: [
    injected({ shimDisconnect: false }),
    walletConnect({
      projectId: WC_PROJECT_ID,
      metadata: METADATA,
      showQrModal: false,
    }),
    coinbaseWallet({
      appName: METADATA.name,
      appLogoUrl: METADATA.icons[0],
      darkMode: true,
      reloadOnDisconnect: true,
    }),
  ],
});

export const FUEL_CONFIG = {
  connectors: defaultConnectors({
    devMode: import.meta.env.DEV,
    wcProjectId: WC_PROJECT_ID,
    ethWagmiConfig: wagmiConfig,
  }),
};
