import { EXPLORER_URL as FUEL_EXPLORER_URL } from "@src/blockchain/constants";

export const getExplorerLinkByHash = (hash: string) => {
  return `${FUEL_EXPLORER_URL}/tx/${hash}`;
};

export const getExplorerLinkByAddress = (address: string) => {
  return `${FUEL_EXPLORER_URL}/account/${address}`;
};
