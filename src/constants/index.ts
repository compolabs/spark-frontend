import { defaultConnectors } from "@fuels/connectors";
import { coinbaseWallet, walletConnect } from "@wagmi/connectors";
import { createConfig, http, injected } from "@wagmi/core";
import { sepolia } from "@wagmi/core/chains";

export const ROUTES = {
  ROOT: "/",
  TRADE: "/:marketId",
  FAUCET: "/faucet",
  SWAP: "/swap",
};

export const isProduction = window.location.host === "app.sprk.fi";

export const ARBITRUM_SEPOLIA_FAUCET = "https://faucet.quicknode.com/arbitrum/sepolia";
export const FUEL_FAUCET = "https://faucet-testnet.fuel.network/?address=";
export const TV_DATAFEED = "https://spark-tv-datafeed.spark-defi.com/api/v1";
export const CHARTS_STORAGE = "https://tv-backend-v4.herokuapp.com/";

export const DEFAULT_DECIMALS = 9;
export const USDC_DECIMALS = 6;

export const TWITTER_LINK = "https://twitter.com/Sprkfi";
export const GITHUB_LINK = "https://github.com/compolabs";
export const DOCS_LINK = "https://docs.sprk.fi";

type TMenuItem = {
  title: string;
  route?: string;
  link?: string;
  events?: string;
};

export const EVENTS = {
  OpenSideAssets: "openSideAssets",
};

export const MENU_ITEMS: Array<TMenuItem> = [
  { title: "TRADE", route: ROUTES.ROOT },
  { title: "FAUCET", route: ROUTES.FAUCET },
  { title: "SWAP", route: ROUTES.SWAP },
  { title: "DOCS", link: "https://docs.sprk.fi" },
  { title: "GITHUB", link: "https://github.com/compolabs/spark" },
  { title: "TWITTER", link: "https://twitter.com/Sprkfi" },
];

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
