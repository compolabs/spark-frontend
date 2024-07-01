import { FueletWalletConnector, FuelWalletConnector, WalletConnectConnector } from "@fuels/connectors";
import { coinbaseWallet, walletConnect } from "@wagmi/connectors";
import { createConfig, http, injected } from "@wagmi/core";
import { mainnet, sepolia } from "@wagmi/core/chains";

export const ROUTES = {
  ROOT: "/",
  TRADE: "/:marketId",
  FAUCET: "/faucet",
};

export const ARBITRUM_SEPOLIA_FAUCET = "https://faucet.quicknode.com/arbitrum/sepolia";
export const FUEL_FAUCET = "https://faucet-testnet.fuel.network/?address=";
export const TV_DATAFEED = "https://spark-tv-datafeed.spark-defi.com/api/v1";
export const CHARTS_STORAGE = "https://tv-backend-v4.herokuapp.com/";

export const DEFAULT_DECIMALS = 9;
export const USDC_DECIMALS = 6;

export const TWITTER_LINK = "https://twitter.com/Sprkfi";
export const GITHUB_LINK = "https://github.com/compolabs/spark";
export const DOCS_LINK = "https://docs.sprk.fi";

type TMenuItem = {
  title: string;
  route?: string;
  link?: string;
};

export const MENU_ITEMS: Array<TMenuItem> = [
  { title: "TRADE", route: ROUTES.ROOT },
  { title: "FAUCET", route: ROUTES.FAUCET },
  { title: "DOCS", link: DOCS_LINK },
  { title: "GITHUB", link: GITHUB_LINK },
  { title: "TWITTER", link: TWITTER_LINK },
];

const WC_PROJECT_ID = "cf4ad9eca02fdf75b8c6ef0b687ddd16";
const METADATA = {
  name: "Spark",
  description: "Spark is the fastest onchain order book based on Fuel Network",
  url: location.href,
  icons: ["https://connectors.fuel.network/logo_white.png"],
};
const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
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
export const isProduction = window.location.host === "app.sprk.fi";

export const FUEL_CONFIG = {
  connectors: [
    new FuelWalletConnector(),
    new FueletWalletConnector(),
    new WalletConnectConnector({
      wagmiConfig: wagmiConfig as any,
      projectId: WC_PROJECT_ID,
    }),
    // new FuelWalletDevelopmentConnector(),
  ],
};
