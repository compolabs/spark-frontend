import { toast } from "react-toastify";
import { Fuel, FueletWalletConnector, FuelWalletConnector } from "@fuel-wallet/sdk";
import { Provider, Wallet, WalletLocked, WalletUnlocked } from "fuels";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { createToast } from "@src/components/Toast";

import { TOKENS_BY_ASSET_ID } from "./constants";
import { NETWORK_ERROR, NetworkError } from "./NetworkError";

export class WalletManager {
  public address: Nullable<string> = null;
  public wallet: Nullable<WalletLocked | WalletUnlocked> = null;
  public privateKey: Nullable<string> = null;

  private fuel = new Fuel({
    connectors: [new FuelWalletConnector(), new FueletWalletConnector()],
  });

  constructor() {
    makeAutoObservable(this);

    this.fuel.on(this.fuel.events.currentAccount, this.onCurrentAccountChange);
  }

  setWallet = async (wallet: string) => {
    const isSelected = await this.fuel.selectConnector(wallet);
    console.log(isSelected, wallet);
    if (!isSelected) {
      toast(
        createToast({
          text: `${wallet} is not installed. Please go to https://fuelet.app/download/. and install it`,
          address: "https://fuelet.app/download/",
        }),
        { type: "error" },
      );
      return false;
    }
    return true;
  };

  connect = async (): Promise<void> => {
    const hasConnector = await this.fuel.hasConnector();

    if (!hasConnector) {
      throw new NetworkError(NETWORK_ERROR.NOT_CONNECTED);
    }
    const isApproved = await this.fuel.connect();

    if (!isApproved) {
      return;
    }

    let account = null;
    try {
      account = await this.fuel.currentAccount();
    } catch (error) {
      console.error("Not authorized");
    }

    if (!account) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_ACCOUNT);
    }

    this.wallet = await this.fuel.getWallet(account);
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

  private onCurrentAccountChange = async (account: Nullable<string>) => {
    if (account === null) {
      try {
        await this.connect();
      } catch (error) {
        if (error instanceof NetworkError) {
          if (error.code === NETWORK_ERROR.UNKNOWN_ACCOUNT) {
            toast(createToast({ text: "Please authorize the wallet account when connecting." }), { type: "info" });
            return;
          }
        }
      }
      return;
    }

    this.wallet = await this.fuel.getWallet(account);
    this.address = account;
  };
}
