import { Provider, Wallet } from "fuels";
import { makeObservable } from "mobx";
import { Nullable } from "tsdef";

import { SpotMarketOrder, SpotMarketTrade, Token } from "@src/entity";
import BN from "@src/utils/BN";

import { BlockchainNetwork } from "../abstract/BlockchainNetwork";
import { NETWORK_ERROR, NetworkError } from "../NetworkError";
import {
  FetchOrdersParams,
  FetchTradesParams,
  MarketCreateEvent,
  NETWORK,
  SpotMarketVolume,
  WalletType,
} from "../types";

import { Api } from "./Api";
import { NETWORKS, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL, TOKENS_LIST } from "./constants";
import { WalletManager } from "./WalletManager";

export class FuelNetwork extends BlockchainNetwork {
  NETWORK_TYPE = NETWORK.FUEL;

  private providerPromise: Promise<Provider>;

  private walletManager = new WalletManager();
  private api = new Api();

  public network = NETWORKS[0];

  constructor() {
    super();

    makeObservable(this.walletManager);

    this.providerPromise = Provider.create(NETWORKS[0].url);
  }

  getAddress = (): Nullable<string> => {
    return this.walletManager.address;
  };

  getPrivateKey(): Nullable<string> {
    return this.walletManager.privateKey;
  }

  getBalance = async (accountAddress: string, assetAddress: string): Promise<string> => {
    return this.walletManager.getBalance(accountAddress, assetAddress);
  };

  getIsExternalWallet = () => false;

  getTokenList = (): Token[] => {
    return TOKENS_LIST;
  };

  getTokenBySymbol = (symbol: string): Token => {
    return TOKENS_BY_SYMBOL[symbol];
  };

  getTokenByAssetId = (assetId: string): Token => {
    return TOKENS_BY_ASSET_ID[assetId.toLowerCase()];
  };

  getWalletType = (): Nullable<any> => {
    return this.walletManager.walletType;
  };

  connectWallet = async (wallet: WalletType): Promise<void> => {
    await this.walletManager.connect(wallet);
  };

  connectWalletByPrivateKey = async (privateKey: string): Promise<void> => {
    await this.walletManager.connectByPrivateKey(privateKey, await this.providerPromise);
  };

  disconnectWallet = (): void => {
    this.walletManager.disconnect();
  };

  addAssetToWallet = async (assetId: string): Promise<void> => {
    await this.walletManager.addAsset(assetId);
  };

  createOrder = async (assetAddress: string, size: string, price: string): Promise<string> => {
    if (!this.walletManager.wallet) {
      throw new Error("Wallet does not exist");
    }

    const baseToken = this.getTokenByAssetId(assetAddress);
    const quoteToken = this.getTokenBySymbol("USDC");

    return this.api.createOrder(baseToken, quoteToken, size, price, this.walletManager.wallet);
  };

  cancelOrder = async (orderId: string): Promise<void> => {
    if (!this.walletManager.wallet) {
      throw new Error("Wallet does not exist");
    }

    await this.api.cancelOrder(orderId, this.walletManager.wallet);
  };

  mintToken = async (assetAddress: string): Promise<void> => {
    if (!this.walletManager.wallet) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_WALLET);
    }

    await this.api.mintToken(assetAddress, this.walletManager.wallet);
  };

  approve = async (assetAddress: string, amount: string): Promise<void> => {};

  allowance = async (assetAddress: string): Promise<string> => {
    return "9999999999999999";
  };

  fetchMarkets = async (limit: number): Promise<MarketCreateEvent[]> => {
    const tokens = [this.getTokenBySymbol("BTC")];
    const providerWallet = await this.getProviderWallet();

    return this.api.fetch.fetchMarkets(limit, tokens, providerWallet);
  };

  fetchMarketPrice = async (baseTokenAddress: string): Promise<BN> => {
    return this.api.fetch.fetchMarketPrice(baseTokenAddress);
  };

  fetchOrders = async (params: FetchOrdersParams): Promise<SpotMarketOrder[]> => {
    const providerWallet = await this.getProviderWallet();

    return this.api.fetch.fetchOrders(params, providerWallet);
  };

  fetchTrades = async (params: FetchTradesParams): Promise<SpotMarketTrade[]> => {
    return this.api.fetch.fetchTrades(params);
  };

  fetchVolume = async (): Promise<SpotMarketVolume> => {
    return this.api.fetch.fetchVolume();
  };

  private getProviderWallet = async () => {
    return Wallet.fromAddress(
      "0xdd8ce029ad3f4f78c0891513dcfa72914d9c7b8fe44faf2e1a9a9b33b5ee5b94",
      await this.providerPromise,
    );
  };
}
