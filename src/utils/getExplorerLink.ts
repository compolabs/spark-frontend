import { CONFIG } from "./getConfig";

export const getExplorerLinkByHash = (hash: string) => {
  return `${CONFIG.APP.links.explorerUrl}/tx/${hash}`;
};

export const getExplorerLinkByAddress = (address: string) => {
  return `${CONFIG.APP.links.explorerUrl}/account/${address}`;
};
