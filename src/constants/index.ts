import { FueletWalletConnector, FuelWalletConnector } from "@fuels/connectors";

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

export const isProduction = window.location.host === "app.sprk.fi";

export const FUEL_CONFIG = {
  connectors: [
    new FuelWalletConnector(),
    new FueletWalletConnector(),
    // new WalletConnectConnector({
    //   wagmiConfig,
    //   projectId: WC_PROJECT_ID,
    // }),
    // new FuelWalletDevelopmentConnector(),
  ],
};
