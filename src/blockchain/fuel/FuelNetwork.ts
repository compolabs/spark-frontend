import { Provider } from "fuels";
import { makeObservable } from "mobx";
import { Nullable } from "tsdef";

import { SpotMarketOrder, SpotMarketTrade, Token } from "@src/entity";
import BN from "@src/utils/BN";

import { BlockchainNetwork } from "../abstract/BlockchainNetwork";
import { FetchOrdersParams, FetchTradesParams, MarketCreateEvent, NETWORK, SpotMarketVolume } from "../types";

import { CONTRACT_ADDRESSES, NETWORKS, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL, TOKENS_LIST } from "./constants";
import { Spark } from "./sdk";
import { WalletManager } from "./WalletManager";

export class FuelNetwork extends BlockchainNetwork {
  NETWORK_TYPE = NETWORK.FUEL;

  private providerPromise: Promise<Provider>;

  private walletManager = new WalletManager();
  private sdk: Spark;

  public network = NETWORKS[0];

  constructor() {
    super();

    makeObservable(this.walletManager);

    this.providerPromise = Provider.create(NETWORKS[0].url);
    this.sdk = new Spark(CONTRACT_ADDRESSES, this.walletManager.wallet ?? undefined);
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

  connectWallet = async (): Promise<void> => {
    await this.walletManager.connect();
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
    return this.sdk.createOrder(assetAddress, size, price);
  };

  cancelOrder = async (orderId: string): Promise<void> => {
    await this.sdk.cancelOrder(orderId);
  };

  mintToken = async (assetAddress: string): Promise<void> => {
    await this.sdk.mintToken(assetAddress);
  };

  approve = async (assetAddress: string, amount: string): Promise<void> => {
    await this.sdk.approve(assetAddress, amount);
  };

  allowance = async (assetAddress: string): Promise<string> => {
    return this.sdk.allowance(assetAddress);
  };

  fetchMarkets = async (limit: number): Promise<MarketCreateEvent[]> => {
    return this.sdk.fetchMarkets(limit);
  };

  fetchMarketPrice = async (baseTokenAddress: string): Promise<BN> => {
    return this.sdk.fetchMarketPrice(baseTokenAddress);
  };

  fetchOrders = async (params: FetchOrdersParams): Promise<SpotMarketOrder[]> => {
    return this.sdk.fetchOrders(params);
  };

  fetchTrades = async (params: FetchTradesParams): Promise<SpotMarketTrade[]> => {
    return this.sdk.fetchTrades(params);
  };

  fetchVolume = async (): Promise<SpotMarketVolume> => {
    return this.sdk.fetchVolume();
  };
}
