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

import {
  Asset,
  IOptions,
  IOptionsSpark,
  PerpAllTraderPosition,
  PerpMarket,
  SparkParams,
  SpotOrder,
  SpotTrades,
} from "./interface";
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

  createSpotOrder = async (baseToken: Asset, quoteToken: Asset, size: string, price: string): Promise<string> => {
    return this.write.createSpotOrder(baseToken, quoteToken, size, price, this.getApiOptions());
  };

  cancelSpotOrder = async (orderId: string): Promise<void> => {
    await this.write.cancelSpotOrder(orderId, this.getApiOptions());
  };

  mintToken = async (token: Asset, amount: string): Promise<void> => {
    await this.write.mintToken(token, amount, this.getApiOptions());
  };

  depositPerpCollateral = async (asset: Asset, amount: string): Promise<void> => {
    await this.write.depositPerpCollateral(asset.address, amount, this.getApiOptions());
  };

  withdrawPerpCollateral = async (
    baseToken: Asset,
    gasToken: Asset,
    amount: string,
    oracleUpdateData: string[],
  ): Promise<void> => {
    await this.write.withdrawPerpCollateral(
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

  removePerpOrder = async (assetId: string): Promise<void> => {
    await this.write.removePerpOrder(assetId, this.getApiOptions());
  };

  fulfillPerpOrder = async (gasToken: Asset, orderId: string, amount: string, updateData: string[]): Promise<void> => {
    return this.write.fulfillPerpOrder(gasToken.address, orderId, amount, updateData, this.getApiOptions());
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

  fetchSpotTrades = async (params: FetchTradesParams): Promise<SpotTrades[]> => {
    return this.read.fetchSpotTrades(params);
  };

  fetchSpotVolume = async (): Promise<SpotMarketVolume> => {
    return this.read.fetchSpotVolume();
  };

  fetchPerpCollateralBalance = async (accountAddress: string, asset: Asset): Promise<BN> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpCollateralBalance(accountAddress, asset.address, options);
  };

  fetchPerpAllTraderPositions = async (accountAddress: string): Promise<PerpAllTraderPosition[]> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpAllTraderPositions(accountAddress, options);
  };

  fetchPerpIsAllowedCollateral = async (asset: Asset): Promise<boolean> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpIsAllowedCollateral(asset.address, options);
  };

  fetchPerpTraderOrders = async (accountAddress: string, asset: Asset) => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpTraderOrders(accountAddress, asset.address, options);
  };

  fetchPerpAllMarkets = async (): Promise<PerpMarket[]> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpAllMarkets(options);
  };

  fetchPerpFundingRate = async (asset: Asset): Promise<BN> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpFundingRate(asset.address, options);
  };

  fetchPerpMaxAbsPositionSize = async (accountAddress: string, asset: Asset): Promise<PerpMaxAbsPositionSize> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpMaxAbsPositionSize(accountAddress, asset.address, options);
  };

  fetchPerpPendingFundingPayment = async (accountAddress: string, asset: Asset): Promise<PerpPendingFundingPayment> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpPendingFundingPayment(accountAddress, asset.address, options);
  };

  fetchPerpMarkPrice = async (asset: Asset): Promise<BN> => {
    const options = await this.getFetchOptions();

    return this.read.fetchPerpMarkPrice(asset.address, options);
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
