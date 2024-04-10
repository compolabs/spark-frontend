import { WalletLocked, WalletUnlocked } from "fuels";

interface IBaseOptions {
  contractAddresses: { [key: string]: string };
}

export interface IOptions extends IBaseOptions {
  wallet: WalletLocked | WalletUnlocked;
}

export interface IOptionsSpark extends IBaseOptions {
  wallet?: WalletLocked | WalletUnlocked;
}
