import { WalletLocked, WalletUnlocked } from "fuels";

export interface Contracts {
  spotMarket: string;
  tokenFactory: string;
  vault: string;
  accountBalance: string;
  clearingHouse: string;
  perpMarket: string;
  pyth: string;
  proxy: string;
}

interface IBaseOptions {
  contractAddresses: Contracts;
  gasPrice: string;
  gasLimit: string;
}

export interface IOptions extends IBaseOptions {
  wallet: WalletLocked | WalletUnlocked;
}

export interface IOptionsSpark extends IBaseOptions {
  wallet?: WalletLocked | WalletUnlocked;
}

export interface SparkParams {
  networkUrl: string;
  contractAddresses: Contracts;
  indexerApiUrl: string;
  wallet?: WalletLocked | WalletUnlocked;
  gasLimit?: string;
  gasPrice?: string;
}
