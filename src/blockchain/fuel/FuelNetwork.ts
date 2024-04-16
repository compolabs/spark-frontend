import { makeObservable } from "mobx";
import Spark from "spark-ts-sdk";
import { Nullable } from "tsdef";

import { PerpMarket, PerpOrder, PerpPosition, SpotMarketOrder, SpotMarketTrade, Token } from "@src/entity";
import { FAUCET_AMOUNTS } from "@src/stores/FaucetStore";
import BN from "@src/utils/BN";

import { BlockchainNetwork } from "../abstract/BlockchainNetwork";
import {
  FetchOrdersParams,
  FetchTradesParams,
  MarketCreateEvent,
  NETWORK,
  PerpMaxAbsPositionSize,
  PerpPendingFundingPayment,
  SpotMarketVolume,
} from "../types";

import {
  CONTRACT_ADDRESSES,
  INDEXER_URL,
  NETWORKS,
  TOKENS_BY_ASSET_ID,
  TOKENS_BY_SYMBOL,
  TOKENS_LIST,
} from "./constants";
import { WalletManager } from "./WalletManager";

export class FuelNetwork extends BlockchainNetwork {
  NETWORK_TYPE = NETWORK.FUEL;

  private walletManager = new WalletManager();
  private sdk: Spark;

  public network = NETWORKS[0];

  constructor() {
    super();

    makeObservable(this.walletManager);

    this.sdk = new Spark({
      networkUrl: NETWORKS[0].url,
      contractAddresses: CONTRACT_ADDRESSES,
      indexerApiUrl: INDEXER_URL,
    });
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
    this.sdk.setActiveWallet(this.walletManager.wallet ?? undefined);
  };

  connectWalletByPrivateKey = async (privateKey: string): Promise<void> => {
    await this.walletManager.connectByPrivateKey(privateKey, await this.sdk.getProvider());
    this.sdk.setActiveWallet(this.walletManager.wallet ?? undefined);
  };

  disconnectWallet = (): void => {
    this.walletManager.disconnect();
    this.sdk.setActiveWallet(this.walletManager.wallet ?? undefined);
  };

  addAssetToWallet = async (assetId: string): Promise<void> => {
    await this.walletManager.addAsset(assetId);
  };

  createSpotOrder = async (assetAddress: string, size: string, price: string): Promise<string> => {
    if (!this.walletManager.wallet) {
      throw new Error("Wallet does not exist");
    }

    const baseToken = this.getTokenByAssetId(assetAddress);

    const baseAsset = { address: baseToken.assetId, decimals: baseToken.decimals };
    const quoteToken = this.getTokenBySymbol("USDC");
    const quoteAsset = { address: quoteToken.assetId, decimals: quoteToken.decimals };

    return this.sdk.createSpotOrder(baseAsset, quoteAsset, size, price);
  };

  cancelSpotOrder = async (orderId: string): Promise<void> => {
    if (!this.walletManager.wallet) {
      throw new Error("Wallet does not exist");
    }

    await this.sdk.cancelSpotOrder(orderId);
  };

  mintToken = async (assetAddress: string): Promise<void> => {
    const token = this.getTokenByAssetId(assetAddress);
    const asset = { address: token.assetId, decimals: token.decimals };
    const amount = FAUCET_AMOUNTS[token.symbol].toString();

    await this.sdk.mintToken(asset, amount);
  };

  approve = async (assetAddress: string, amount: string): Promise<void> => {};

  allowance = async (assetAddress: string): Promise<string> => {
    return "999999999999999999";
  };

  depositPerpCollateral = async (assetAddress: string, amount: string): Promise<void> => {
    const token = this.getTokenByAssetId(assetAddress);
    const asset = { address: token.assetId, decimals: token.decimals };

    await this.sdk.depositPerpCollateral(asset, amount);
  };

  withdrawPerpCollateral = async (assetAddress: string, amount: string, oracleUpdateData: string[]): Promise<void> => {
    const baseToken = this.getTokenByAssetId(assetAddress);
    const baseAsset = { address: baseToken.assetId, decimals: baseToken.decimals };
    const gasToken = this.getTokenBySymbol("ETH");
    const gasAsset = { address: gasToken.assetId, decimals: gasToken.decimals };

    await this.sdk.withdrawPerpCollateral(baseAsset, gasAsset, amount, oracleUpdateData);
  };

  openPerpOrder = async (
    assetAddress: string,
    amount: string,
    price: string,
    updateData: string[],
  ): Promise<string> => {
    const baseToken = this.getTokenByAssetId(assetAddress);
    const baseAsset = { address: baseToken.assetId, decimals: baseToken.decimals };
    const gasToken = this.getTokenBySymbol("ETH");
    const gasAsset = { address: gasToken.assetId, decimals: gasToken.decimals };

    return this.sdk.openPerpOrder(baseAsset, gasAsset, amount, price, updateData);
  };

  removePerpOrder = async (assetId: string): Promise<void> => {
    await this.sdk.removePerpOrder(assetId);
  };

  fulfillPerpOrder = async (orderId: string, amount: string, updateData: string[]): Promise<void> => {
    const gasToken = this.getTokenBySymbol("ETH");
    const gasAsset = { address: gasToken.assetId, decimals: gasToken.decimals };

    return this.sdk.fulfillPerpOrder(gasAsset, orderId, amount, updateData);
  };

  fetchSpotMarkets = async (limit: number): Promise<MarketCreateEvent[]> => {
    return this.sdk.fetchSpotMarkets(limit);
  };

  fetchSpotMarketPrice = async (baseTokenAddress: string): Promise<BN> => {
    const token = this.getTokenByAssetId(baseTokenAddress);
    const asset = { address: token.assetId, decimals: token.decimals };

    return this.sdk.fetchSpotMarketPrice(asset);
  };

  fetchSpotOrders = async (params: FetchOrdersParams): Promise<SpotMarketOrder[]> => {
    const orders = await this.sdk.fetchSpotOrders(params);

    return orders.map((obj) => new SpotMarketOrder(obj));
  };

  fetchSpotTrades = async (params: FetchTradesParams): Promise<SpotMarketTrade[]> => {
    const trades = await this.sdk.fetchSpotTrades(params);

    return trades.map((obj) => new SpotMarketTrade(obj));
  };

  fetchSpotVolume = async (): Promise<SpotMarketVolume> => {
    return this.sdk.fetchSpotVolume();
  };

  fetchPerpCollateralBalance = async (accountAddress: string, assetAddress: string): Promise<BN> => {
    const token = this.getTokenByAssetId(assetAddress);
    const asset = { address: token.assetId, decimals: token.decimals };

    return this.sdk.fetchPerpCollateralBalance(accountAddress, asset);
  };

  fetchPerpAllTraderPositions = async (accountAddress: string): Promise<PerpPosition[]> => {
    const positions = await this.sdk.fetchPerpAllTraderPositions(accountAddress);

    return positions.map((obj) => new PerpPosition(obj));
  };

  fetchPerpIsAllowedCollateral = async (assetAddress: string): Promise<boolean> => {
    const token = this.getTokenByAssetId(assetAddress);
    const asset = { address: token.assetId, decimals: token.decimals };

    return this.sdk.fetchPerpIsAllowedCollateral(asset);
  };

  fetchPerpTraderOrders = async (accountAddress: string, assetAddress: string): Promise<PerpOrder[]> => {
    const token = this.getTokenByAssetId(assetAddress);
    const asset = { address: token.assetId, decimals: token.decimals };
    const orders = await this.sdk.fetchPerpTraderOrders(accountAddress, asset);

    return orders.map((obj) => new PerpOrder(obj));
  };

  fetchPerpAllMarkets = async (): Promise<PerpMarket[]> => {
    const assets = this.getTokenList().map((token) => ({ address: token.assetId, decimals: token.decimals }));
    const usdc = this.getTokenBySymbol("USDC");
    const quoteToken = { address: usdc.assetId, decimals: usdc.decimals };
    const markets = await this.sdk.fetchPerpAllMarkets(assets, quoteToken);

    return markets.map((obj) => new PerpMarket(obj));
  };

  fetchPerpFundingRate = async (assetAddress: string): Promise<BN> => {
    const token = this.getTokenByAssetId(assetAddress);
    const asset = { address: token.assetId, decimals: token.decimals };

    return this.sdk.fetchPerpFundingRate(asset);
  };

  fetchPerpMaxAbsPositionSize = async (
    accountAddress: string,
    assetAddress: string,
  ): Promise<PerpMaxAbsPositionSize> => {
    const token = this.getTokenByAssetId(assetAddress);
    const asset = { address: token.assetId, decimals: token.decimals };

    return this.sdk.fetchPerpMaxAbsPositionSize(accountAddress, asset);
  };

  fetchPerpPendingFundingPayment = async (
    accountAddress: string,
    assetAddress: string,
  ): Promise<PerpPendingFundingPayment> => {
    const token = this.getTokenByAssetId(assetAddress);
    const asset = { address: token.assetId, decimals: token.decimals };

    return this.sdk.fetchPerpPendingFundingPayment(accountAddress, asset);
  };

  fetchPerpMarkPrice = async (assetAddress: string): Promise<BN> => {
    const token = this.getTokenByAssetId(assetAddress);
    const asset = { address: token.assetId, decimals: token.decimals };

    return this.sdk.fetchPerpMarkPrice(asset);
  };
}
