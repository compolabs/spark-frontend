import { Provider, Wallet } from "fuels";
import { WalletLocked, WalletUnlocked } from "fuels";

import { NETWORK_ERROR, NetworkError } from "@src/blockchain/NetworkError";
import { FetchOrdersParams, FetchTradesParams, MarketCreateEvent, SpotMarketVolume } from "@src/blockchain/types";
import { SpotMarketOrder, SpotMarketTrade, Token } from "@src/entity";
import BN from "@src/utils/BN";

import { NETWORKS, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "../constants";

import { Api } from "./Api";
import { Fetch } from "./Fetch";
import { IOptions, IOptionsSpark } from "./interface";

export class Spark {
  private api: Api;
  private fetch: Fetch;

  private providerPromise: Promise<Provider>;
  private options: IOptionsSpark;

  private baseToken: Token | null = null;
  private quoteToken: Token | null = null;

  constructor(contractAddresses: { [key: string]: string }, wallet?: WalletLocked | WalletUnlocked) {
    this.options = { contractAddresses: contractAddresses, wallet: wallet };
    this.api = new Api();
    this.fetch = new Fetch();

    this.providerPromise = Provider.create(NETWORKS[0].url);
  }

  createOrder = async (assetAddress: string, size: string, price: string): Promise<string> => {
    if (!this.options.wallet) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_WALLET);
    }

    this.baseToken = this.getTokenByAssetId(assetAddress);
    this.quoteToken = this.getTokenBySymbol("USDC");

    return this.api.createOrder(this.baseToken, this.quoteToken, size, price, this.options as IOptions);
  };

  cancelOrder = async (orderId: string): Promise<void> => {
    if (!this.options.wallet) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_WALLET);
    }

    await this.api.cancelOrder(orderId, this.options as IOptions);
  };

  mintToken = async (assetAddress: string): Promise<void> => {
    if (!this.options.wallet) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_WALLET);
    }

    await this.api.mintToken(assetAddress, this.options as IOptions);
  };

  approve = async (assetAddress: string, amount: string): Promise<void> => {};

  allowance = async (assetAddress: string): Promise<string> => {
    return "9999999999999999";
  };

  getTokenByAssetId = (assetId: string): Token => {
    return TOKENS_BY_ASSET_ID[assetId.toLowerCase()];
  };

  getTokenBySymbol = (symbol: string): Token => {
    return TOKENS_BY_SYMBOL[symbol];
  };

  fetchMarkets = async (limit: number): Promise<MarketCreateEvent[]> => {
    const tokens = [this.getTokenBySymbol("BTC")];
    const providerWallet = await this.getProviderWallet();
    const options: IOptions = { ...this.options, wallet: providerWallet };

    return this.fetch.fetchMarkets(limit, tokens, options);
  };

  fetchMarketPrice = async (baseTokenAddress: string): Promise<BN> => {
    return this.fetch.fetchMarketPrice(baseTokenAddress);
  };

  fetchOrders = async (params: FetchOrdersParams): Promise<SpotMarketOrder[]> => {
    const providerWallet = await this.getProviderWallet();
    const options: IOptions = { ...this.options, wallet: providerWallet };

    return this.fetch.fetchOrders(params, options);
  };

  fetchTrades = async (params: FetchTradesParams): Promise<SpotMarketTrade[]> => {
    return this.fetch.fetchTrades(params);
  };

  fetchVolume = async (): Promise<SpotMarketVolume> => {
    return this.fetch.fetchVolume();
  };

  private getProviderWallet = async () => {
    return Wallet.fromAddress(
      "0xdd8ce029ad3f4f78c0891513dcfa72914d9c7b8fe44faf2e1a9a9b33b5ee5b94",
      await this.providerPromise,
    );
  };
}
