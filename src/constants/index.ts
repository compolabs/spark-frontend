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

type TMenuItem = {
  title: string;
  route?: string;
  link?: string;
};

export const MENU_ITEMS: Array<TMenuItem> = [
  { title: "TRADE", route: ROUTES.ROOT },
  { title: "FAUCET", route: ROUTES.FAUCET },
  { title: "DOCS", link: "https://docs.sprk.fi" },
  { title: "GITHUB", link: "https://github.com/compolabs/spark" },
  { title: "TWITTER", link: "https://twitter.com/Sprkfi" },
];
