import React, { PropsWithChildren, useMemo } from "react";
import {
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
import { DEFAULT_DECIMALS } from "@src/constants";
import { SpotMarketOrder } from "@src/entity";
import useVM from "@src/hooks/useVM";
import { RootStore, useStores } from "@src/stores";
import BN from "@src/utils/BN";
import { ACTION_MESSAGE_TYPE, getActionMessage } from "@src/utils/getActionMessage";
import { handleWalletErrors } from "@src/utils/handleWalletErrors";
import Math from "@src/utils/Math";

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
  LimitFOK,
  LimitIOC, // TODO: Когда TimeInForce будет переделана в отдельную вкладку оставить только тип limit
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
          this.setInputPriceThrottle(price);
        } else if (
          orderType === ORDER_TYPE.Limit &&
          this.inputPrice.isZero() &&
          this.activeInput !== ACTIVE_INPUT.Price
        ) {
          this.setInputPriceThrottle(price);
        }
      },
    );

    // reset input values when switch from perp to spot
    reaction(
      () => tradeStore.market,
      () => {
        this.setInputAmount(BN.ZERO);
        this.setInputTotal(BN.ZERO);
        this.setInputPercent(0);
      },
    );

    reaction(
      () => this.inputTotal,
      (total) => {
        this.fetchExchangeFeeDebounce(total.toString());
      },
    );
  }

  get canProceed() {
    return (
      this.inputAmount.gt(BN.ZERO) && this.inputPrice.gt(BN.ZERO) && this.inputTotal.gt(BN.ZERO) && !this.isInputError
    );
  }

  get isInputError(): boolean {
    return this.isSpotInputError;
  }

  get exchangeFee(): BN {
    const { tradeStore } = this.rootStore;
    const { makerFee, takerFee } = tradeStore.tradeFee;

    return BN.max(makerFee, takerFee);
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
    this.onSpotMaxClick();
  };

  fetchExchangeFee = (total: string) => {
    const { tradeStore } = this.rootStore;
    tradeStore.fetchTradeFee(total);
  };

  fetchExchangeFeeDebounce = _.debounce(this.fetchExchangeFee, 250);

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
    const { settingsStore } = this.rootStore;
    this.inputPrice = price;
    if (settingsStore.orderType !== ORDER_TYPE.Market) this.setActiveInput(ACTIVE_INPUT.Price);
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
  }

  private updatePercent(): void {
    const { tradeStore, balanceStore } = this.rootStore;

    if (!tradeStore.market) return;

    const { assetId } = this.isSell ? tradeStore.market.baseToken : tradeStore.market.quoteToken;
    const balance = balanceStore.getContractBalanceInfo(assetId).amount;

    if (balance.isZero()) {
      this.inputPercent = BN.ZERO;
      return;
    }

    const percentageOfTotal = this.isSell
      ? BN.ratioOf(this.inputAmount, balance)
      : BN.ratioOf(this.inputTotal, balance);

    this.inputPercent = percentageOfTotal.gt(100) ? new BN(100) : percentageOfTotal.toDecimalPlaces(0);
  }

  setInputPriceThrottle = _.throttle(this.setInputPrice, PRICE_UPDATE_THROTTLE_INTERVAL);

  setInputPercent = (value: number | number[]) => (this.inputPercent = new BN(value.toString()));

  createOrder = async () => {
    const { tradeStore, notificationStore, balanceStore, mixPanelStore, settingsStore, accountStore } = this.rootStore;
    const { market } = tradeStore;
    const { orderType } = settingsStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!market) return;

    this.isLoading = true;

    if (bcNetwork.getIsExternalWallet()) {
      notificationStore.info({
        text: "Please, confirm operation in your wallet",
      });
    }

    try {
      let hash: Undefinable<string> = "";
      const type = this.mode === ORDER_MODE.BUY ? OrderType.Buy : OrderType.Sell;
      const typeMarket = this.mode === ORDER_MODE.BUY ? OrderType.Sell : OrderType.Buy;
      const timeInForce = settingsStore.timeInForce;
      if (timeInForce === LimitType.GTC) {
        const order: CreateOrderParams = {
          amount: this.inputAmount.toString(),
          price: this.inputPrice.toString(),
          type,
        };
        const data = await bcNetwork.createSpotOrder(order);
        hash = data.transactionId;
      } else {
        const params: GetOrdersParams = {
          limit: 50,
          asset: tradeStore?.market?.baseToken.assetId ?? "",
          status: ["Active"],
        };
        console.log('params', {
          ...params,
          orderType: typeMarket,
        })
        const sellOrders = await bcNetwork!.fetchSpotOrders({
          ...params,
          orderType: typeMarket,
        });
        const order: FulfillOrderManyParams = {
          amount: this.inputAmount.toString(),
          orderType: type,
          limitType: timeInForce,
          price:
            orderType === ORDER_TYPE.Market
              ? sellOrders[sellOrders.length - 1].price.toString() : this.inputPrice.toString(),
          orders: sellOrders.map((el) => el.id),
          slippage: "10000",
        };
        console.log('order', order)
        const data = await bcNetwork.swapTokens(order);
        hash = data.transactionId;
      }

      const token = this.mode === ORDER_MODE.BUY ? market.baseToken : market.quoteToken;
      const amount = this.mode === ORDER_MODE.BUY ? this.inputAmount : this.inputTotal;

      notificationStore.success({
        text: getActionMessage(ACTION_MESSAGE_TYPE.CREATING_ORDER)(
          BN.formatUnits(amount, token.decimals).toSignificant(2),
          token.symbol,
          BN.formatUnits(this.inputPrice, DEFAULT_DECIMALS).toSignificant(2),
          this.mode === ORDER_MODE.BUY ? "buy" : "sell",
        ),
        hash,
      });
      mixPanelStore.trackEvent("createOrder", { type: "" });
    } catch (error: any) {
      handleWalletErrors(notificationStore, error, getActionMessage(ACTION_MESSAGE_TYPE.CREATING_ORDER_FAILED)());
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
}
