import { Address } from "fuels";

import { PerpMarket, PerpOrder, PerpPosition, SpotMarketOrder, SpotMarketTrade } from "@src/entity";
import BN from "@src/utils/BN";

import {
  FetchOrdersParams,
  FetchTradesParams,
  MarketCreateEvent,
  PerpMaxAbsPositionSize,
  PerpPendingFundingPayment,
  SpotMarketVolume,
} from "../../types";
import { TOKENS_BY_SYMBOL, TOKENS_LIST } from "../constants";
import { convertI64ToBn } from "../utils";

import { AccountBalanceAbi__factory } from "./types/account-balance";
import { AddressInput, AssetIdInput } from "./types/account-balance/AccountBalanceAbi";
import { ClearingHouseAbi__factory } from "./types/clearing-house";
import { PerpMarketAbi__factory } from "./types/perp-market";
import { VaultAbi__factory } from "./types/vault";
import getUnixTime from "./utils/getUnixTime";
import { IndexerApi } from "./IndexerApi";
import { IOptions } from "./interface";

export class Fetch {
  private indexerApi: IndexerApi;

  constructor(url: string) {
    this.indexerApi = new IndexerApi(url);
  }

  fetchSpotMarkets = async (limit: number): Promise<MarketCreateEvent[]> => {
    const data = await this.indexerApi.getSpotMarketCreateEvents();

    const markets = data.map((market) => ({
      id: market.asset_id,
      assetId: market.asset_id,
      decimal: Number(market.asset_decimals),
    }));

    return markets;
  };

  fetchSpotMarketPrice = async (baseToken: string): Promise<BN> => {
    console.warn("[fetchMarketPrice] NOT IMPLEMENTED FOR FUEL");
    return BN.ZERO;
  };

  fetchSpotOrders = async ({
    baseToken,
    type,
    limit,
    trader,
    isActive,
  }: FetchOrdersParams): Promise<SpotMarketOrder[]> => {
    const traderAddress = trader ? new Address(trader as any).toB256() : undefined;

    const data = await this.indexerApi.getSpotOrders({
      baseToken,
      orderType: type,
      limit,
      trader: traderAddress,
      isOpened: isActive,
    });

    const orders = data.map((order) => {
      const baseSize = new BN(order.base_size);
      const basePrice = new BN(order.base_price);
      return new SpotMarketOrder({
        id: order.order_id,
        baseToken: order.base_token,
        trader: order.trader,
        baseSize: baseSize.toNumber(),
        orderPrice: basePrice.toNumber(),
        blockTimestamp: getUnixTime(order.createdAt),
      });
    });

    return orders;
  };

  fetchSpotTrades = async ({ baseToken, limit, trader }: FetchTradesParams): Promise<SpotMarketTrade[]> => {
    const traderAddress = trader ? new Address(trader as any).toB256() : undefined;

    const data = await this.indexerApi.getSpotTradeEvents({ limit, trader: traderAddress, baseToken });

    return data.map(
      (trade) =>
        new SpotMarketTrade({
          baseToken: trade.base_token,
          buyer: trade.buyer,
          id: String(trade.id),
          matcher: trade.order_matcher,
          seller: trade.seller,
          tradeAmount: new BN(trade.trade_size),
          price: new BN(trade.trade_price),
          timestamp: getUnixTime(trade.createdAt),
          userAddress: trader,
        }),
    );
  };

  fetchSpotVolume = async (): Promise<SpotMarketVolume> => {
    console.warn("[fetchVolume] NOT IMPLEMENTED FOR FUEL");
    return { volume: BN.ZERO, high: BN.ZERO, low: BN.ZERO };
  };

  fetchPerpCollateralBalance = async (accountAddress: string, assetAddress: string, options: IOptions): Promise<BN> => {
    const vaultFactory = VaultAbi__factory.connect(options.contractAddresses.vault, options.wallet);

    const addressInput: AddressInput = {
      value: new Address(accountAddress as any).toB256(),
    };

    const assetIdInput: AssetIdInput = {
      value: assetAddress,
    };

    const result = await vaultFactory.functions.get_collateral_balance(addressInput, assetIdInput).get();

    const collateralBalance = new BN(result.value.toString());

    return collateralBalance;
  };

  fetchPerpAllTraderPositions = async (accountAddress: string, options: IOptions): Promise<PerpPosition[]> => {
    const accountBalanceFactory = AccountBalanceAbi__factory.connect(
      options.contractAddresses.accountBalance,
      options.wallet,
    );

    const addressInput: AddressInput = {
      value: new Address(accountAddress as any).toB256(),
    };

    const result = await accountBalanceFactory.functions.get_all_trader_positions(addressInput).get();

    const positions = result.value.map(
      ([assetAddress, accountBalance]) =>
        new PerpPosition({
          baseTokenAddress: assetAddress.value,
          lastTwPremiumGrowthGlobal: convertI64ToBn(accountBalance.last_tw_premium_growth_global),
          takerOpenNational: convertI64ToBn(accountBalance.taker_open_notional),
          takerPositionSize: convertI64ToBn(accountBalance.taker_position_size),
        }),
    );

    return positions;
  };

  fetchPerpMarketPrice = async (assetAddress: string, options: IOptions): Promise<BN> => {
    const perpMarketFactory = PerpMarketAbi__factory.connect(options.contractAddresses.perpMarket, options.wallet);

    const assetIdInput: AssetIdInput = {
      value: assetAddress,
    };

    const result = await perpMarketFactory.functions.get_market_price(assetIdInput).get();

    const marketPrice = new BN(result.value.toString());

    return marketPrice;
  };

  fetchPerpFundingRate = async (assetAddress: string, options: IOptions): Promise<BN> => {
    const accountBalanceFactory = AccountBalanceAbi__factory.connect(
      options.contractAddresses.accountBalance,
      options.wallet,
    );

    const assetIdInput: AssetIdInput = {
      value: assetAddress,
    };

    const result = await accountBalanceFactory.functions.get_funding_rate(assetIdInput).get();

    const fundingRate = convertI64ToBn(result.value);

    return fundingRate;
  };

  fetchPerpFreeCollateral = async (accountAddress: string, options: IOptions): Promise<any> => {
    const vaultFactory = VaultAbi__factory.connect(options.contractAddresses.vault, options.wallet);

    const addressInput: AddressInput = {
      value: new Address(accountAddress as any).toB256(),
    };

    const result = await vaultFactory.functions.get_free_collateral(addressInput).get();

    const freeCollateral = new BN(result.value.toString());

    return freeCollateral;
  };

  fetchPerpMarket = async (assetAddress: string, options: IOptions): Promise<PerpMarket> => {
    const clearingHouseFactory = ClearingHouseAbi__factory.connect(
      options.contractAddresses.clearingHouse,
      options.wallet,
    );

    const assetIdInput: AssetIdInput = {
      value: assetAddress,
    };

    const result = await clearingHouseFactory.functions.get_market(assetIdInput).get();

    const pausedIndexPrice = result.value.paused_index_price
      ? new BN(result.value.paused_index_price.toString())
      : undefined;
    const pausedTimestamp = result.value.paused_timestamp ? result.value.paused_timestamp.toNumber() : undefined;
    const closedPrice = result.value.closed_price ? new BN(result.value.closed_price.toString()) : undefined;

    const perpMarket = new PerpMarket({
      baseTokenAddress: result.value.asset_id.value,
      quoteTokenAddress: TOKENS_BY_SYMBOL["USDC"].assetId,
      imRatio: new BN(result.value.im_ratio.toString()),
      mmRatio: new BN(result.value.mm_ratio.toString()),
      status: result.value.status,
      pausedIndexPrice,
      pausedTimestamp,
      closedPrice,
    });

    return perpMarket;
  };

  fetchPerpAllMarkets = async (options: IOptions): Promise<PerpMarket[]> => {
    const markets: PerpMarket[] = [];

    for (const token of TOKENS_LIST) {
      try {
        const market = await this.fetchPerpMarket(token.assetId, options);
        markets.push(market);
      } catch {
        /* empty */
      }
    }

    return markets;
  };

  fetchPerpPendingFundingPayment = async (
    accountAddress: string,
    assetAddress: string,
    options: IOptions,
  ): Promise<PerpPendingFundingPayment> => {
    const accountBalanceFactory = AccountBalanceAbi__factory.connect(
      options.contractAddresses.accountBalance,
      options.wallet,
    );

    const addressInput: AddressInput = {
      value: new Address(accountAddress as any).toB256(),
    };

    const assetIdInput: AssetIdInput = {
      value: assetAddress,
    };

    const result = await accountBalanceFactory.functions.get_pending_funding_payment(addressInput, assetIdInput).get();

    const fundingPayment = convertI64ToBn(result.value[0]);
    const fundingGrowthPayment = convertI64ToBn(result.value[1]);

    return { fundingPayment, fundingGrowthPayment };
  };

  fetchPerpIsAllowedCollateral = async (assetAddress: string, options: IOptions): Promise<boolean> => {
    const vaultFactory = VaultAbi__factory.connect(options.contractAddresses.vault, options.wallet);

    const assetIdInput: AssetIdInput = {
      value: assetAddress,
    };

    const result = await vaultFactory.functions.is_allowed_collateral(assetIdInput).get();

    return result.value;
  };

  fetchPerpTraderOrders = async (
    accountAddress: string,
    assetAddress: string,
    options: IOptions,
  ): Promise<PerpOrder[]> => {
    const vaultFactory = PerpMarketAbi__factory.connect(options.contractAddresses.perpMarket, options.wallet);

    const addressInput: AddressInput = {
      value: new Address(accountAddress as any).toB256(),
    };

    const assetIdInput: AssetIdInput = {
      value: assetAddress,
    };

    const result = await vaultFactory.functions.get_trader_orders(addressInput, assetIdInput).get();

    const orders = result.value.map(
      (order) =>
        new PerpOrder({
          id: order.id,
          baseSize: convertI64ToBn(order.base_size),
          baseTokenAddress: order.base_token.value,
          orderPrice: new BN(order.order_price.toString()),
          trader: order.trader.value,
        }),
    );

    return orders;
  };

  fetchPerpMaxAbsPositionSize = async (
    accountAddress: string,
    assetAddress: string,
    options: IOptions,
  ): Promise<PerpMaxAbsPositionSize> => {
    const clearingHouseFactory = ClearingHouseAbi__factory.connect(
      options.contractAddresses.clearingHouse,
      options.wallet,
    );

    const addressInput: AddressInput = {
      value: new Address(accountAddress as any).toB256(),
    };

    const assetIdInput: AssetIdInput = {
      value: assetAddress,
    };

    const result = await clearingHouseFactory.functions.get_max_abs_position_size(addressInput, assetIdInput).get();

    const shortSize = new BN(result.value[0].toString());
    const longSize = new BN(result.value[0].toString());

    return { shortSize, longSize };
  };

  fetchPerpMarkPrice = async (assetAddress: string, options: IOptions): Promise<BN> => {
    const vaultFactory = PerpMarketAbi__factory.connect(options.contractAddresses.perpMarket, options.wallet);

    const assetIdInput: AssetIdInput = {
      value: assetAddress,
    };

    const result = await vaultFactory.functions.get_mark_price(assetIdInput).get();

    const markPrice = new BN(result.value.toString());

    return markPrice;
  };
}
