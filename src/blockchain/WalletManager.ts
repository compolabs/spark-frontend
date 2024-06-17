import { FuelWalletConnector } from "@fuels/connectors";
import { Account, Fuel, Provider, Wallet, WalletLocked, WalletUnlocked } from "fuels";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { TOKENS_BY_ASSET_ID } from "./constants";
import { NETWORK_ERROR, NetworkError } from "./NetworkError";

export class WalletManager {
  public address: Nullable<string> = null;
  public wallet: Nullable<WalletLocked | WalletUnlocked> = null;
  public privateKey: Nullable<string> = null;

  private fuel = new Fuel({
    connectors: [new FuelWalletConnector()],
  });

  constructor() {
    makeAutoObservable(this);
  }

  setWallet = async (account: string, wallet?: Account | null) => {
    let currentAccount: string | null = null;
    try {
      currentAccount = await this.fuel.currentAccount();
    } catch (error) {
      console.error("Not authorized for fuel");
    }
    if (currentAccount) {
      try {
        const fuelWallet = await this.fuel.getWallet(account);
        this.wallet = fuelWallet as any;
      } catch (err) {
        console.error("There is no wallet for this account");
      }
    } else {
      // for ethereum wallets should be another logic to connect
      this.wallet = wallet as any;
    }
    this.address = account;
  };

  connectByPrivateKey = async (privateKey: string, provider: Provider): Promise<void> => {
    const wallet = Wallet.fromPrivateKey(privateKey, provider);

    this.privateKey = privateKey;
    this.address = wallet.address.toString();
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

    const token = TOKENS_BY_ASSET_ID[assetId];

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

  getBalance = async (address: string, assetId: string) => {
    if (!this.wallet) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_WALLET);
    }

    const balance = await this.wallet.getBalance(assetId);
    return balance.toString();
  };

  disconnect = () => {
    this.address = null;
    this.privateKey = null;

    void this.fuel.disconnect();
  };
}
