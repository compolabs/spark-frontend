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
import BN from "@src/utils/BN";

import { IOptions, IOptionsSpark, SparkParams } from "./interface";
import { ReadActions } from "./ReadActions";
import { WriteActions } from "./WriteActions";

const DEFAULT_GAS_LIMIT = "20000000";
const DEFAULT_GAS_PRICE = "1";

export class Spark {
  private write = new WriteActions();

  private read: ReadActions;

  private providerPromise: Promise<Provider>;
  private options: IOptionsSpark;

  constructor(params: SparkParams) {
    this.options = {
      contractAddresses: params.contractAddresses,
      wallet: params.wallet,
      gasLimit: params.gasLimit ?? DEFAULT_GAS_LIMIT,
      gasPrice: params.gasPrice ?? DEFAULT_GAS_PRICE,
    };

    this.read = new ReadActions(params.indexerApiUrl);

    this.providerPromise = Provider.create(params.networkUrl);
  }

  setActiveWallet = (wallet?: WalletLocked | WalletUnlocked) => {
    const newOptions = { ...this.options };
    newOptions.wallet = wallet;
    this.options = newOptions;
  };

  createSpotOrder = async (
    baseTokenAddress: string,
    quoteTokenAddress: string,
    size: string,
    price: string,
  ): Promise<string> => {
    return this.write.createSpotOrder(baseTokenAddress, quoteTokenAddress, size, price, this.getApiOptions());
  };

  cancelSpotOrder = async (orderId: string): Promise<void> => {
    await this.write.cancelSpotOrder(orderId, this.getApiOptions());
  };

  mintToken = async (tokenAddress: string, amount: string): Promise<void> => {
    await this.write.mintToken(tokenAddress, amount, this.getApiOptions());
  };

  depositPerpCollateral = async (assetAddress: string, amount: string): Promise<void> => {
    await this.write.depositPerpCollateral(assetAddress, amount, this.getApiOptions());
  };

  withdrawPerpCollateral = async (
    baseTokenAddress: string,
    gasTokenAddress: string,
    amount: string,
    oracleUpdateData: string[],
  ): Promise<void> => {
    await this.write.withdrawPerpCollateral(
      baseTokenAddress,
      gasTokenAddress,
      amount,
      oracleUpdateData,
      this.getApiOptions(),
    );
  };

  openPerpOrder = async (
    baseTokenAddress: string,
    gasTokenAddress: string,
    amount: string,
    price: string,
    updateData: string[],
  ): Promise<string> => {
    return this.write.openPerpOrder(baseTokenAddress, gasTokenAddress, amount, price, updateData, this.getApiOptions());
  };

  removePerpOrder = async (assetId: string): Promise<void> => {
    await this.write.removePerpOrder(assetId, this.getApiOptions());
  };

  fulfillPerpOrder = async (
    gasTokenAddress: string,
    orderId: string,
    amount: string,
    updateData: string[],
  ): Promise<void> => {
    return this.write.fulfillPerpOrder(gasTokenAddress, orderId, amount, updateData, this.getApiOptions());
  };

  fetchSpotMarkets = async (limit: number): Promise<MarketCreateEvent[]> => {
    return this.read.fetchSpotMarkets(limit);
  };

  fetchSpotMarketPrice = async (baseTokenAddress: string): Promise<BN> => {
    return this.read.fetchSpotMarketPrice(baseTokenAddress);
  };

  fetchSpotOrders = async (params: FetchOrdersParams): Promise<any[]> => {
    return this.read.fetchSpotOrders(params);
  };

  fetchSpotTrades = async (params: FetchTradesParams): Promise<any[]> => {
    return this.read.fetchSpotTrades(params);
  };

  fetchSpotVolume = async (): Promise<SpotMarketVolume> => {
    return this.read.fetchSpotVolume();
  };

  fetchPerpCollateralBalance = async (accountAddress: string, assetAddress: string): Promise<BN> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpCollateralBalance(accountAddress, assetAddress, options);
  };

  fetchPerpAllTraderPositions = async (accountAddress: string): Promise<any[]> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpAllTraderPositions(accountAddress, options);
  };

  fetchPerpIsAllowedCollateral = async (assetAddress: string): Promise<boolean> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpIsAllowedCollateral(assetAddress, options);
  };

  fetchPerpTraderOrders = async (accountAddress: string, assetAddress: string) => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpTraderOrders(accountAddress, assetAddress, options);
  };

  fetchPerpAllMarkets = async (): Promise<any[]> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpAllMarkets(options);
  };

  fetchPerpFundingRate = async (assetAddress: string): Promise<BN> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpFundingRate(assetAddress, options);
  };

  fetchPerpMaxAbsPositionSize = async (
    accountAddress: string,
    assetAddress: string,
  ): Promise<PerpMaxAbsPositionSize> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpMaxAbsPositionSize(accountAddress, assetAddress, options);
  };

  fetchPerpPendingFundingPayment = async (
    accountAddress: string,
    assetAddress: string,
  ): Promise<PerpPendingFundingPayment> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpPendingFundingPayment(accountAddress, assetAddress, options);
  };

  fetchPerpMarkPrice = async (assetAddress: string): Promise<BN> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpMarkPrice(assetAddress, options);
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
