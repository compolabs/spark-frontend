import { CONFIG } from "./getConfig";

export const getExplorerLinkByHash = (hash: string) => {
  return `${CONFIG.APP.explorerUrl}/tx/${hash}`;
};

export const getExplorerLinkByAddress = (address: string) => {
  return `${CONFIG.APP.explorerUrl}/account/${address}`;
};
