import { Account, B256Address, Fuel, Provider, Wallet, WalletLocked, WalletUnlocked } from "fuels";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { FUEL_CONFIG } from "@constants";
import { CONFIG } from "@utils/getConfig";

import { NETWORK_ERROR, NetworkError } from "./NetworkError";
import { Balances } from "./types";

export class WalletManager {
  public address: Nullable<B256Address> = null;
  public wallet: Nullable<Account | WalletLocked | WalletUnlocked> = null;
  public privateKey: Nullable<string> = null;

  private fuel = new Fuel(FUEL_CONFIG);

  constructor() {
    makeAutoObservable(this);
  }

  connect = async (wallet: Account) => {
    this.address = wallet.address.toB256();
    this.wallet = wallet;
  };

  connectByPrivateKey = async (privateKey: string, provider: Provider): Promise<void> => {
    const wallet = Wallet.fromPrivateKey(privateKey, provider);

    this.privateKey = privateKey;
    this.address = wallet.address.toB256();
    this.wallet = wallet;
  };

  addAsset = async (assetId: string) => {
    // Не добавляем, если авторизированы по приватному ключу
    if (this.privateKey?.length) {
      return;
    }

    if (!this.address) {
      throw new NetworkError(NETWORK_ERROR.NOT_CONNECTED);
    }

    const token = CONFIG.TOKENS_BY_ASSET_ID[assetId];

    if (!token) {
      throw new NetworkError(NETWORK_ERROR.INVALID_TOKEN);
    }

    const fuelNetwork = {
      type: "fuel",
      chainId: 0, // TODO: ???
      decimals: token.decimals,
      assetId: token.assetId,
      contractId: "string", // TODO: ???
    } as const;

    const asset = {
      name: token.name,
      symbol: token.symbol,
      icon: token.logo,
      networks: [fuelNetwork],
    };

    await this.fuel.addAsset(asset);
  };

  getBalances = async (): Promise<Balances> => {
    if (!this.wallet) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_WALLET);
    }

    const response = await this.wallet.getBalances();

    return response.balances.reduce((prev, balance) => {
      return {
        ...prev,
        [balance.assetId]: balance.amount.toString(),
      };
    }, {});
  };

  disconnect = async () => {
    this.address = null;
    this.privateKey = null;
    this.wallet = null;

    await this.fuel.disconnect();
  };
}
