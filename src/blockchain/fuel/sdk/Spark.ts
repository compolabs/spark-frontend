import { Provider, Wallet, WalletLocked, WalletUnlocked } from "fuels";

import { NETWORK_ERROR, NetworkError } from "@src/blockchain/NetworkError";
import {
  FetchOrdersParams,
  FetchTradesParams,
  MarketCreateEvent,
  PerpMaxAbsPositionSize,
  PerpPendingFundingPayment,
  SpotMarketVolume,
} from "@src/blockchain/types";
import { PerpMarket, PerpPosition, SpotMarketOrder, SpotMarketTrade, Token } from "@src/entity";
import BN from "@src/utils/BN";

import { Api } from "./Api";
import { Fetch } from "./Fetch";
import { IOptions, IOptionsSpark, SparkParams } from "./interface";

const DEFAULT_GAS_LIMIT = "20000000";
const DEFAULT_GAS_PRICE = "1";

export class Spark {
  private api = new Api();

  private fetch: Fetch;

  private providerPromise: Promise<Provider>;
  private options: IOptionsSpark;

  constructor(params: SparkParams) {
    this.options = {
      contractAddresses: params.contractAddresses,
      wallet: params.wallet,
      gasLimit: params.gasLimit ?? DEFAULT_GAS_LIMIT,
      gasPrice: params.gasPrice ?? DEFAULT_GAS_PRICE,
    };

    this.fetch = new Fetch(params.indexerApiUrl);

    this.providerPromise = Provider.create(params.networkUrl);
  }

  setActiveWallet = (wallet?: WalletLocked | WalletUnlocked) => {
    const newOptions = { ...this.options };
    newOptions.wallet = wallet;
    this.options = newOptions;
  };

  createSpotOrder = async (baseToken: Token, quoteToken: Token, size: string, price: string): Promise<string> => {
    return this.api.createSpotOrder(baseToken, quoteToken, size, price, this.getApiOptions());
  };

  cancelSpotOrder = async (orderId: string): Promise<void> => {
    await this.api.cancelSpotOrder(orderId, this.getApiOptions());
  };

  mintToken = async (token: Token, amount: string): Promise<void> => {
    await this.api.mintToken(token, amount, this.getApiOptions());
  };

  approve = async (assetAddress: string, amount: string): Promise<void> => {};

  allowance = async (assetAddress: string): Promise<string> => {
    return "9999999999999999";
  };

  depositPerpCollateral = async (assetAddress: string, amount: string): Promise<void> => {
    await this.api.depositPerpCollateral(assetAddress, amount, this.getApiOptions());
  };

  withdrawPerpCollateral = async (
    baseToken: Token,
    gasToken: Token,
    amount: string,
    oracleUpdateData: string[],
  ): Promise<void> => {
    await this.api.withdrawPerpCollateral(baseToken, gasToken, amount, oracleUpdateData, this.getApiOptions());
  };

  openPerpOrder = async (
    baseToken: Token,
    gasToken: Token,
    amount: string,
    price: string,
    updateData: string[],
  ): Promise<string> => {
    return this.api.openPerpOrder(baseToken, gasToken, amount, price, updateData, this.getApiOptions());
  };

  removePerpOrder = async (assetId: string): Promise<void> => {
    await this.api.removePerpOrder(assetId, this.getApiOptions());
  };

  fulfillPerpOrder = async (gasToken: Token, orderId: string, amount: string, updateData: string[]): Promise<void> => {
    return this.api.fulfillPerpOrder(gasToken, orderId, amount, updateData, this.getApiOptions());
  };

  fetchSpotMarkets = async (limit: number): Promise<MarketCreateEvent[]> => {
    return this.fetch.fetchSpotMarkets(limit);
  };

  fetchSpotMarketPrice = async (baseTokenAddress: string): Promise<BN> => {
    return this.fetch.fetchSpotMarketPrice(baseTokenAddress);
  };

  fetchSpotOrders = async (params: FetchOrdersParams): Promise<SpotMarketOrder[]> => {
    return this.fetch.fetchSpotOrders(params);
  };

  fetchSpotTrades = async (params: FetchTradesParams): Promise<SpotMarketTrade[]> => {
    return this.fetch.fetchSpotTrades(params);
  };

  fetchSpotVolume = async (): Promise<SpotMarketVolume> => {
    return this.fetch.fetchSpotVolume();
  };

  fetchPerpCollateralBalance = async (accountAddress: string, assetAddress: string): Promise<BN> => {
    const options = await this.getFetchOptions();

    return this.fetch.fetchPerpCollateralBalance(accountAddress, assetAddress, options);
  };

  fetchPerpAllTraderPositions = async (accountAddress: string): Promise<PerpPosition[]> => {
    const options = await this.getFetchOptions();

    return this.fetch.fetchPerpAllTraderPositions(accountAddress, options);
  };

  fetchPerpIsAllowedCollateral = async (assetAddress: string): Promise<boolean> => {
    const options = await this.getFetchOptions();

    return this.fetch.fetchPerpIsAllowedCollateral(assetAddress, options);
  };

  fetchPerpTraderOrders = async (accountAddress: string, assetAddress: string) => {
    const options = await this.getFetchOptions();

    return this.fetch.fetchPerpTraderOrders(accountAddress, assetAddress, options);
  };

  fetchPerpAllMarkets = async (): Promise<PerpMarket[]> => {
    const options = await this.getFetchOptions();

    return this.fetch.fetchPerpAllMarkets(options);
  };

  fetchPerpFundingRate = async (assetAddress: string): Promise<BN> => {
    const options = await this.getFetchOptions();

    return this.fetch.fetchPerpFundingRate(assetAddress, options);
  };

  fetchPerpMaxAbsPositionSize = async (
    accountAddress: string,
    assetAddress: string,
  ): Promise<PerpMaxAbsPositionSize> => {
    const options = await this.getFetchOptions();

    return this.fetch.fetchPerpMaxAbsPositionSize(accountAddress, assetAddress, options);
  };

  fetchPerpPendingFundingPayment = async (
    accountAddress: string,
    assetAddress: string,
  ): Promise<PerpPendingFundingPayment> => {
    const options = await this.getFetchOptions();

    return this.fetch.fetchPerpPendingFundingPayment(accountAddress, assetAddress, options);
  };

  fetchPerpMarkPrice = async (assetAddress: string): Promise<BN> => {
    const options = await this.getFetchOptions();

    return this.fetch.fetchPerpMarkPrice(assetAddress, options);
  };

  getProviderWallet = async () => {
    const provider = await this.providerPromise;
    return Wallet.generate({ provider });
  };

  getProvider = async () => {
    return this.providerPromise;
  };

  private getFetchOptions = async (): Promise<IOptions> => {
    const providerWallet = await this.getProviderWallet();
    const options: IOptions = { ...this.options, wallet: providerWallet };

    return options;
  };

  private getApiOptions = (): IOptions => {
    if (!this.options.wallet) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_WALLET);
    }

    return this.options as IOptions;
  };
}
