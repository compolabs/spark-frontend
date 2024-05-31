import { Contract, JsonRpcProvider } from "ethers";
import { makeObservable } from "mobx";
import { Nullable } from "tsdef";

import { PerpMarket, PerpOrder, PerpPosition, SpotMarketOrder, SpotMarketTrade, Token } from "@src/entity";
import BN from "@src/utils/BN";

import { BlockchainNetwork } from "../abstract/BlockchainNetwork";
import { NETWORK_ERROR, NetworkError } from "../NetworkError";
import {
  FetchOrdersParams,
  FetchTradesParams,
  MarketCreateEvent,
  NETWORK,
  PerpMaxAbsPositionSize,
  PerpPendingFundingPayment,
  SpotMarketVolume,
} from "../types";

import { ERC20_ABI } from "./abi";
import { Api } from "./Api";
import { NETWORKS, PROVIDERS, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL, TOKENS_LIST } from "./constants";
import { EvmAddress } from "./types";
import { WalletManager } from "./WalletManager";

export class EVMNetwork extends BlockchainNetwork {
  NETWORK_TYPE = NETWORK.EVM;

  private provider: JsonRpcProvider;

  private walletManager = new WalletManager();
  private api = new Api();

  public network = NETWORKS[0];

  constructor() {
    super();

    makeObservable(this.walletManager);

    this.provider = PROVIDERS[this.network.chainId];
  }

  getAddress = (): Nullable<string> => {
    return this.walletManager.address;
  };

  getPrivateKey = (): Nullable<string> => {
    return this.walletManager.privateKey;
  };

  getIsExternalWallet = () => {
    return this.walletManager.isRemoteProvider;
  };

  getBalance = async (accountAddress: EvmAddress, assetAddress: EvmAddress): Promise<string> => {
    if (assetAddress === this.getTokenBySymbol("ETH").assetId) {
      const balance = await this.provider.getBalance(accountAddress);
      return balance.toString();
    }

    const contract = new Contract(assetAddress, ERC20_ABI, this.provider);
    const balance = await contract.balanceOf(accountAddress);
    return balance.toString();
  };

  getTokenList = (): Token[] => {
    return TOKENS_LIST;
  };

  getTokenBySymbol = (symbol: string): Token => {
    return TOKENS_BY_SYMBOL[symbol];
  };

  getTokenByAssetId = (assetId: EvmAddress): Token => {
    return TOKENS_BY_ASSET_ID[assetId.toLowerCase()];
  };

  connectWallet = async (): Promise<void> => {
    await this.walletManager.connect(this.network);
  };

  connectWalletByPrivateKey = async (privateKey: string): Promise<void> => {
    await this.walletManager.connectByPrivateKey(privateKey, this.network);
  };

  disconnectWallet = (): void => {
    this.walletManager.disconnect();
  };

  matchPerpOrders(): Promise<unknown> {
    throw new Error("Method not implemented.");
  }

  addAssetToWallet = async (assetId: EvmAddress): Promise<void> => {
    await this.walletManager.addAsset(assetId);
  };

  createSpotOrder = async (assetAddress: EvmAddress, size: string, price: string): Promise<string> => {
    if (!this.walletManager.signer) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_SIGNER);
    }

    return this.api.createOrder(assetAddress, size, price, this.walletManager.signer);
  };

  cancelSpotOrder = async (orderId: string): Promise<void> => {
    if (!this.walletManager.signer) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_SIGNER);
    }

    await this.api.cancelOrder(orderId, this.walletManager.signer);
  };

  mintToken = async (assetAddress: EvmAddress): Promise<void> => {
    if (!this.walletManager.signer) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_SIGNER);
    }

    await this.api.mintToken(assetAddress, this.walletManager.signer);
  };

  approve = async (assetAddress: EvmAddress, amount: string): Promise<void> => {
    if (!this.walletManager.signer) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_SIGNER);
    }

    await this.api.approve(assetAddress, amount, this.walletManager.signer);
  };

  allowance = async (assetAddress: EvmAddress): Promise<string> => {
    if (!this.walletManager.signer) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_SIGNER);
    }

    return this.api.allowance(assetAddress, this.walletManager.signer);
  };

  depositPerpCollateral = async (assetAddress: string, amount: string): Promise<void> => {
    return;
  };
  withdrawPerpCollateral = async (assetAddress: string, amount: string, tokenPriceFeed: string): Promise<void> => {
    return;
  };
  openPerpOrder = async (
    assetAddress: string,
    amount: string,
    price: string,
    tokenPriceFeed: string,
  ): Promise<string> => {
    return "";
  };
  removePerpOrder = async (orderId: string): Promise<void> => {
    return;
  };
  fulfillPerpOrder = async (orderId: string, amount: string, tokenPriceFeed: string): Promise<void> => {
    return;
  };

  fetchSpotMarkets = async (limit: number): Promise<MarketCreateEvent[]> => {
    return this.api.fetch.fetchMarkets(limit);
  };
  fetchSpotMarketPrice = async (baseTokenAddress: EvmAddress): Promise<BN> => {
    return this.api.fetch.fetchMarketPrice(baseTokenAddress);
  };
  fetchSpotOrders = async (params: FetchOrdersParams<EvmAddress>): Promise<SpotMarketOrder[]> => {
    return this.api.fetch.fetchOrders(params);
  };
  fetchSpotTrades = async (params: FetchTradesParams<EvmAddress>): Promise<SpotMarketTrade[]> => {
    return this.api.fetch.fetchTrades(params);
  };
  fetchSpotVolume = async (): Promise<SpotMarketVolume> => {
    return this.api.fetch.fetchVolume();
  };

  fetchPerpTrades = async (params: FetchTradesParams<EvmAddress>): Promise<SpotMarketTrade[]> => {
    return [];
    // return this.api.fetch.fetchTrades(params);
  };

  fetchPerpCollateralBalance = async (accountAddress: string, assetAddress: string): Promise<BN> => {
    return BN.ZERO;
  };
  fetchPerpAllTraderPositions = async (accountAddress: string): Promise<PerpPosition[]> => {
    return [];
  };
  fetchPerpIsAllowedCollateral = async (assetAddress: string): Promise<boolean> => {
    return false;
  };
  fetchPerpTraderOrders = async (accountAddress: string, assetAddress: string): Promise<PerpOrder[]> => {
    return [];
  };
  fetchPerpAllMarkets = async (): Promise<PerpMarket[]> => {
    return [];
  };
  fetchPerpFundingRate = async (): Promise<BN> => {
    return BN.ZERO;
  };
  fetchPerpMaxAbsPositionSize = async (): Promise<PerpMaxAbsPositionSize> => {
    return { shortSize: BN.ZERO, longSize: BN.ZERO };
  };
  fetchPerpPendingFundingPayment = async (): Promise<PerpPendingFundingPayment> => {
    return { fundingGrowthPayment: BN.ZERO, fundingPayment: BN.ZERO };
  };
  fetchPerpMarkPrice = async (): Promise<BN> => {
    return BN.ZERO;
  };
}
