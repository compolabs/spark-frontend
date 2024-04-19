import { Provider, Wallet, WalletLocked, WalletUnlocked } from "fuels";

import BN from "./utils/BN";
import { NETWORK_ERROR, NetworkError } from "./utils/NetworkError";
import { DEFAULT_GAS_PRICE } from "./constants";
import {
  Asset,
  FetchOrdersParams,
  FetchTradesParams,
  MarketCreateEvent,
  Options,
  OptionsSpark,
  PerpAllTraderPosition,
  PerpMarket,
  PerpMaxAbsPositionSize,
  PerpPendingFundingPayment,
  SparkParams,
  SpotMarketVolume,
  SpotOrder,
  SpotTrades,
} from "./interface";
import { ReadActions } from "./ReadActions";
import { WriteActions } from "./WriteActions";

export class Spark {
  private write = new WriteActions();

  private read: ReadActions;

  private providerPromise: Promise<Provider>;
  private options: OptionsSpark;

  constructor(params: SparkParams) {
    this.options = {
      contractAddresses: params.contractAddresses,
      wallet: params.wallet,
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
    baseToken: Asset,
    quoteToken: Asset,
    size: string,
    price: string,
  ): Promise<string> => {
    return this.write.createSpotOrder(
      baseToken,
      quoteToken,
      size,
      price,
      this.getApiOptions(),
    );
  };

  cancelSpotOrder = async (orderId: string): Promise<string> => {
    return this.write.cancelSpotOrder(orderId, this.getApiOptions());
  };

  matchSpotOrders = async (
    sellOrderId: string,
    buyOrderId: string,
  ): Promise<string> => {
    return this.write.matchSpotOrders(
      sellOrderId,
      buyOrderId,
      this.getApiOptions(),
    );
  };

  mintToken = async (token: Asset, amount: string): Promise<string> => {
    return this.write.mintToken(token, amount, this.getApiOptions());
  };

  depositPerpCollateral = async (
    asset: Asset,
    amount: string,
  ): Promise<string> => {
    return this.write.depositPerpCollateral(
      asset.address,
      amount,
      this.getApiOptions(),
    );
  };

  withdrawPerpCollateral = async (
    baseToken: Asset,
    gasToken: Asset,
    amount: string,
    oracleUpdateData: string[],
  ): Promise<string> => {
    return this.write.withdrawPerpCollateral(
      baseToken.address,
      gasToken.address,
      amount,
      oracleUpdateData,
      this.getApiOptions(),
    );
  };

  openPerpOrder = async (
    baseToken: Asset,
    gasToken: Asset,
    amount: string,
    price: string,
    updateData: string[],
  ): Promise<string> => {
    return this.write.openPerpOrder(
      baseToken.address,
      gasToken.address,
      amount,
      price,
      updateData,
      this.getApiOptions(),
    );
  };

  removePerpOrder = async (assetId: string): Promise<string> => {
    return this.write.removePerpOrder(assetId, this.getApiOptions());
  };

  fulfillPerpOrder = async (
    gasToken: Asset,
    orderId: string,
    amount: string,
    updateData: string[],
  ): Promise<string> => {
    return this.write.fulfillPerpOrder(
      gasToken.address,
      orderId,
      amount,
      updateData,
      this.getApiOptions(),
    );
  };

  fetchSpotMarkets = async (limit: number): Promise<MarketCreateEvent[]> => {
    return this.read.fetchSpotMarkets(limit);
  };

  fetchSpotMarketPrice = async (baseToken: Asset): Promise<BN> => {
    return this.read.fetchSpotMarketPrice(baseToken.address);
  };

  fetchSpotOrders = async (params: FetchOrdersParams): Promise<SpotOrder[]> => {
    return this.read.fetchSpotOrders(params);
  };

  fetchSpotTrades = async (
    params: FetchTradesParams,
  ): Promise<SpotTrades[]> => {
    return this.read.fetchSpotTrades(params);
  };

  fetchSpotVolume = async (): Promise<SpotMarketVolume> => {
    return this.read.fetchSpotVolume();
  };

  fetchSpotOrderById = async (orderId: string): Promise<SpotOrder> => {
    return this.read.fetchSpotOrderById(orderId);
  };

  fetchPerpCollateralBalance = async (
    accountAddress: string,
    asset: Asset,
  ): Promise<BN> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpCollateralBalance(
      accountAddress,
      asset.address,
      options,
    );
  };

  fetchPerpAllTraderPositions = async (
    accountAddress: string,
  ): Promise<PerpAllTraderPosition[]> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpAllTraderPositions(accountAddress, options);
  };

  fetchPerpIsAllowedCollateral = async (asset: Asset): Promise<boolean> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpIsAllowedCollateral(asset.address, options);
  };

  fetchPerpTraderOrders = async (accountAddress: string, asset: Asset) => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpTraderOrders(
      accountAddress,
      asset.address,
      options,
    );
  };

  fetchPerpAllMarkets = async (
    assetList: Asset[],
    quoteAsset: Asset,
  ): Promise<PerpMarket[]> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpAllMarkets(assetList, quoteAsset, options);
  };

  fetchPerpFundingRate = async (asset: Asset): Promise<BN> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpFundingRate(asset.address, options);
  };

  fetchPerpMaxAbsPositionSize = async (
    accountAddress: string,
    asset: Asset,
  ): Promise<PerpMaxAbsPositionSize> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpMaxAbsPositionSize(
      accountAddress,
      asset.address,
      options,
    );
  };

  fetchPerpPendingFundingPayment = async (
    accountAddress: string,
    asset: Asset,
  ): Promise<PerpPendingFundingPayment> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpPendingFundingPayment(
      accountAddress,
      asset.address,
      options,
    );
  };

  fetchPerpMarkPrice = async (asset: Asset): Promise<BN> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpMarkPrice(asset.address, options);
  };

  fetchWalletBalance = async (asset: Asset): Promise<string> => {
    const options = await this.getFetchOptions();

    return this.read.fetchWalletBalance(asset.address, options);
  };

  getProviderWallet = async () => {
    const provider = await this.providerPromise;
    return Wallet.generate({ provider });
  };

  getProvider = async () => {
    return this.providerPromise;
  };

  private getFetchOptions = async (): Promise<Options> => {
    const providerWallet = await this.getProviderWallet();
    const options: Options = { ...this.options, wallet: providerWallet };

    return options;
  };

  private getApiOptions = (): Options => {
    if (!this.options.wallet) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_WALLET);
    }

    return this.options as Options;
  };
}
