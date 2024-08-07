import React, { PropsWithChildren, useMemo } from "react";
import {
  AssetType,
  CreateOrderParams,
  FulfillOrderManyParams,
  GetOrdersParams,
  LimitType,
  OrderType,
} from "@compolabs/spark-orderbook-ts-sdk";
import _ from "lodash";
import { makeAutoObservable, reaction } from "mobx";
import { Undefinable } from "tsdef";

import { FuelNetwork } from "@src/blockchain";
import { PerpMaxAbsPositionSize } from "@src/blockchain/types";
import { createToast } from "@src/components/Toast";
import { DEFAULT_DECIMALS } from "@src/constants";
import { SpotMarketOrder } from "@src/entity";
import useVM from "@src/hooks/useVM";
import BN from "@src/utils/BN";
import { handleWalletErrors } from "@src/utils/handleWalletErrors";
import Math from "@src/utils/Math";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<CreateOrderVM | null>(null);

export const CreateOrderVMProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new CreateOrderVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useCreateOrderVM = () => useVM(ctx);

const HALF_GWEI = new BN(5 * 1e9); // 0.5
const PRICE_UPDATE_THROTTLE_INTERVAL = 1000; // 1s

export enum ORDER_MODE {
  BUY,
  SELL,
}

export enum ACTIVE_INPUT {
  Price,
  Amount,
  Total,
}

export enum ORDER_TYPE {
  Market,
  Limit,
  StopMarket,
  StopLimit,
  TakeProfit,
  TakeProfitLimit,
}

class CreateOrderVM {
  isLoading = false;

  mode = ORDER_MODE.BUY;

  activeInput = ACTIVE_INPUT.Amount;

  inputPrice = BN.ZERO;
  inputAmount = BN.ZERO;
  inputPercent = BN.ZERO;
  inputTotal = BN.ZERO;

  inputLeverage = BN.ZERO;
  inputLeveragePercent = BN.ZERO;

  maxPositionSize: PerpMaxAbsPositionSize = {
    shortSize: BN.ZERO,
    longSize: BN.ZERO,
  };

  matcherFee = BN.ZERO;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    const { tradeStore, oracleStore, settingsStore } = this.rootStore;

    reaction(
      () => oracleStore.prices,
      () => {
        const { orderType } = settingsStore;
        const token = tradeStore.market?.baseToken;
        const price = token?.priceFeed ? oracleStore.getTokenIndexPrice(token?.priceFeed) : BN.ZERO;

        if (orderType === ORDER_TYPE.Market) {
          this.setInputPriceDebounce(price);
        } else if (
          orderType === ORDER_TYPE.Limit &&
          this.inputPrice.eq(BN.ZERO) &&
          this.activeInput !== ACTIVE_INPUT.Price
        ) {
          this.setInputPriceDebounce(price);
        }
      },
    );

    // PERP Logic
    // reaction(
    //   () => [tradeStore.market, accountStore.address, Array.from(collateralStore.balances)],
    //   async () => {
    //     await this.getMaxPositionSize();
    //   },
    // );

    // reset input values when switch from perp to spot
    reaction(
      () => tradeStore.market,
      () => {
        this.setInputAmount(BN.ZERO);
        this.setInputTotal(BN.ZERO);
        this.setInputPercent(0);
      },
    );

    this.fetchMarketFee();
  }

  get canProceed() {
    return (
      this.inputAmount.gt(BN.ZERO) && this.inputPrice.gt(BN.ZERO) && this.inputTotal.gt(BN.ZERO) && !this.isInputError
    );
  }

  get isInputError(): boolean {
    const { tradeStore } = this.rootStore;

    if (tradeStore.isPerp) return this.isPerpInputError;

    return this.isSpotInputError;
  }

  get isPerpInputError(): boolean {
    const maxSize = this.isSell ? this.maxPositionSize.shortSize : this.maxPositionSize.longSize;
    return this.inputAmount.gt(maxSize);
  }

  get isSpotInputError(): boolean {
    const { tradeStore, balanceStore } = this.rootStore;
    const { market } = tradeStore;
    const amount = this.isSell ? this.inputAmount : this.inputTotal;
    const token = this.isSell ? market!.baseToken.assetId : market!.quoteToken.assetId;
    const balance = balanceStore.getContractBalanceInfo(token).amount;
    return balance ? amount.gt(balance) : false;
  }

  get isSell(): boolean {
    return this.mode === ORDER_MODE.SELL;
  }

  setActiveInput = (input?: ACTIVE_INPUT) => (this.activeInput = input === undefined ? ACTIVE_INPUT.Amount : input);

  setOrderMode = (mode: ORDER_MODE) => {
    this.mode = mode;

    this.setInputAmount(BN.ZERO);
    this.setInputTotal(BN.ZERO);
    this.setInputPercent(0);
  };

  onMaxClick = () => {
    // PERP Logic
    // const { tradeStore } = this.rootStore;

    // if (tradeStore.isPerp) {
    //   this.onPerpMaxClick();
    //   return;
    // }

    this.onSpotMaxClick();
  };

  private onSpotMaxClick = () => {
    const { tradeStore, balanceStore, mixPanelStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!tradeStore.market) return;

    const { assetId } = this.isSell ? tradeStore.market.baseToken : tradeStore.market.quoteToken;

    let balance = balanceStore.getContractBalanceInfo(assetId).amount ?? BN.ZERO;
    if (assetId === bcNetwork!.getTokenBySymbol("ETH").assetId) {
      balance = balance.minus(HALF_GWEI);
    }

    if (this.isSell) {
      this.setInputAmount(balance);
      return;
    }

    mixPanelStore.trackEvent("onMaxBtnClick", { type: this.isSell ? "SELL" : "BUY", value: balance.toString() });

    this.setInputTotal(balance);
  };

  setInputPrice = (price: BN) => {
    this.inputPrice = price;
    this.setActiveInput(ACTIVE_INPUT.Price);
    this.calculateInputs();
  };

  setInputAmount = (amount: BN) => {
    this.inputAmount = amount;
    this.setActiveInput(ACTIVE_INPUT.Amount);
    this.calculateInputs();
  };

  setInputTotal = (total: BN) => {
    this.inputTotal = total;
    this.setActiveInput(ACTIVE_INPUT.Total);
    this.calculateInputs();
  };

  private calculateInputs(): void {
    const { tradeStore } = this.rootStore;
    if (!tradeStore.market) return;

    const baseDecimals = tradeStore.market.baseToken.decimals;
    const quoteDecimals = tradeStore.market.quoteToken.decimals;

    const newInputTotal = Math.multiplyWithDifferentDecimals(
      this.inputAmount,
      baseDecimals,
      this.inputPrice,
      DEFAULT_DECIMALS,
      quoteDecimals,
    );

    const newInputAmount = Math.divideWithDifferentDecimals(
      this.inputTotal,
      quoteDecimals,
      this.inputPrice,
      DEFAULT_DECIMALS,
      baseDecimals,
    );

    switch (this.activeInput) {
      case ACTIVE_INPUT.Price:
      case ACTIVE_INPUT.Amount:
        this.inputTotal = newInputTotal;
        break;
      case ACTIVE_INPUT.Total:
        this.inputAmount = newInputAmount;
        break;
    }

    this.updatePercent();

    // PERP Logic
    // this.calculateLeverage();
  }

  private updatePercent(): void {
    const { tradeStore, balanceStore } = this.rootStore;

    if (!tradeStore.market) return;

    const { assetId } = this.isSell ? tradeStore.market.baseToken : tradeStore.market.quoteToken;
    const balance = balanceStore.getContractBalanceInfo(assetId).amount;

    if (balance.eq(BN.ZERO)) {
      this.inputPercent = BN.ZERO;
      return;
    }

    const percentageOfTotal = this.isSell
      ? BN.ratioOf(this.inputAmount, balance)
      : BN.ratioOf(this.inputTotal, balance);

    this.inputPercent = percentageOfTotal.gt(100) ? new BN(100) : percentageOfTotal.toDecimalPlaces(0);
  }

  setInputPriceDebounce = _.throttle(this.setInputPrice, PRICE_UPDATE_THROTTLE_INTERVAL);

  setInputPercent = (value: number | number[]) => (this.inputPercent = new BN(value.toString()));

  createOrder = async () => {
    const { tradeStore, notificationStore, balanceStore, mixPanelStore, settingsStore } = this.rootStore;
    const { market } = tradeStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!market) return;

    this.isLoading = true;

    if (bcNetwork.getIsExternalWallet()) {
      notificationStore.toast(createToast({ text: "Please, confirm operation in your wallet" }), { type: "info" });
    }

    try {
      let hash: Undefinable<string> = "";
      const type = this.mode === ORDER_MODE.BUY ? OrderType.Buy : OrderType.Sell;
      const typeMarket = this.mode === ORDER_MODE.BUY ? OrderType.Sell : OrderType.Buy;
      if (ORDER_TYPE.Market === settingsStore.orderType) {
        const params: GetOrdersParams = {
          limit: 50,
          asset: tradeStore?.market?.baseToken.assetId ?? "",
          status: ["Active"],
        };
        const sellOrders = await bcNetwork!.fetchSpotOrders({
          ...params,
          orderType: typeMarket,
        });

        const order: FulfillOrderManyParams = {
          amount: this.inputAmount.toString(),
          assetType: AssetType.Base,
          orderType: type,
          limitType: LimitType.FOK, // TODO: Check is it correct
          price: sellOrders[sellOrders.length - 1].price.toString(),
          orders: sellOrders.map((el) => el.id),
          slippage: "100",
          feeAssetId: bcNetwork.getTokenBySymbol("ETH").assetId,
        };
        const data = await bcNetwork.swapTokens(order);
        hash = data.transactionId;
      } else {
        if (tradeStore.isPerp) {
          console.log("[PERP] Not implemented");
          // const data = (await bcNetwork?.openPerpOrder(
          //   baseToken.assetId,
          //   baseSize.toString(),
          //   this.inputPrice.toString(),
          //   baseToken.priceFeed,
          // )) as WriteTransactionResponse;
          // hash = data?.transactionId;
        } else {
          const order: CreateOrderParams = {
            amount: this.inputAmount.toString(),
            assetType: AssetType.Base,
            price: this.inputPrice.toString(),
            type,
            feeAssetId: bcNetwork.getTokenBySymbol("ETH").assetId,
          };
          const data = await bcNetwork.createSpotOrder(order);
          hash = data.transactionId;
        }
      }

      notificationStore.toast(createToast({ text: "Order Created", hash: hash }), {
        type: "success",
      });
      mixPanelStore.trackEvent("createOrder", { type: "" });
    } catch (error: any) {
      console.error(error);
      handleWalletErrors(notificationStore, error, "We were unable to process your order at this time");
    }

    await balanceStore.update();

    this.isLoading = false;
  };

  selectOrderbookOrder = async (order: SpotMarketOrder, mode: ORDER_MODE) => {
    const { settingsStore } = this.rootStore;

    settingsStore.setOrderType(ORDER_TYPE.Limit);
    this.setOrderMode(mode);
    this.setInputPrice(order.price);
  };

  fetchMarketFee = async () => {
    const bcNetwork = FuelNetwork.getInstance();

    const fee = await bcNetwork.fetchSpotMatcherFee();

    this.matcherFee = new BN(fee);
  };

  // PERP Logic
  // setInputLeverage = (value: BN) => (this.inputLeverage = value);
  // setInputLeveragePercent = (value: BN | number | number[]) => (this.inputLeveragePercent = new BN(value.toString()));

  // calculateLeverage = () => {
  //   let percentageLeverageOfMaxPosition =
  //     this.inputAmount.eq(BN.ZERO) || this.maxPositionSize.longSize.eq(BN.ZERO)
  //       ? BN.ZERO
  //       : BN.ratioOf(this.inputAmount, this.maxPositionSize.longSize);

  //   if (this.isSell) {
  //     percentageLeverageOfMaxPosition = BN.ratioOf(this.inputAmount, this.maxPositionSize.shortSize);
  //   }

  //   const leverage = percentageLeverageOfMaxPosition.toDecimalPlaces(0);
  //   const inputPercent = percentageLeverageOfMaxPosition.gt(100) ? 100 : leverage;

  //   this.setInputLeverage(leverage);
  //   this.setInputLeveragePercent(inputPercent);
  // };

  // private onPerpMaxClick = async () => {
  //   const { tradeStore } = this.rootStore;

  //   if (!tradeStore.market) return;

  //   const leverageAmount = this.isSell ? this.maxPositionSize.shortSize : this.maxPositionSize.longSize;

  //   if (this.isSell) {
  //     this.setInputAmount(leverageAmount, true);
  //     return;
  //   }

  //   this.setInputAmount(leverageAmount, true);
  // };

  // getMaxPositionSize = async () => {
  //   const { tradeStore, accountStore } = this.rootStore;
  //   const bcNetwork = FuelNetwork.getInstance();

  //   if (!tradeStore.market || !accountStore.isConnected || this.inputPrice.eq(BN.ZERO)) return;

  //   this.maxPositionSize = await bcNetwork!.fetchPerpMaxAbsPositionSize(
  //     accountStore.address!,
  //     tradeStore.market.baseToken.assetId,
  //     this.inputPrice.toString(),
  //   );
  // };
}
