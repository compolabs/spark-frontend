import React, { PropsWithChildren, useMemo } from "react";
import _ from "lodash";
import { makeAutoObservable, reaction } from "mobx";
import { Undefinable } from "tsdef";

import { Blockchain } from "@blockchain";
import {
  BN,
  CompactMarketInfo,
  CreateOrderWithDepositParams,
  FulfillOrderManyWithDepositParams,
  GetActiveOrdersParams,
  LimitType,
  Order,
  OrderType,
} from "@blockchain/fuel/types";

import useVM from "@hooks/useVM";
import { RootStore, useStores } from "@stores";
import { MIXPANEL_EVENTS } from "@stores/MixPanelStore";

import { DEFAULT_DECIMALS } from "@constants";
import { ACTION_MESSAGE_TYPE, getActionMessage } from "@utils/getActionMessage";
import { CONFIG } from "@utils/getConfig";
import { getRealFee } from "@utils/getRealFee";
import { handleWalletErrors } from "@utils/handleWalletErrors";
import Math from "@utils/Math";

import { SpotMarket, SpotMarketOrder } from "@entity";

const ctx = React.createContext<CreateOrderVM | null>(null);

export const CreateOrderVMProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new CreateOrderVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useCreateOrderVM = () => useVM(ctx);

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

interface DepositInfo {
  amountToSpend: string;
  amountFee: string;
}

class CreateOrderVM {
  isLoading = false;

  mode = ORDER_MODE.BUY;

  activeInput = ACTIVE_INPUT.Amount;

  inputPrice = BN.ZERO;
  slippage = new BN(10);
  inputAmount = BN.ZERO;
  inputPercent = BN.ZERO;
  inputTotal = BN.ZERO;

  inputLeverage = BN.ZERO;
  inputLeveragePercent = BN.ZERO;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    const { tradeStore, spotOrderBookStore, settingsStore } = this.rootStore;

    // TODO: Fix the bug where the price doesn’t change when switching markets
    reaction(
      () => [spotOrderBookStore.buyOrders, spotOrderBookStore.sellOrders],
      ([buyOrders, sellOrders]) => {
        const orders = this.isSell ? buyOrders : sellOrders;
        const order = orders[orders.length - 1];

        if (!order) return;

        const shouldSetMarketPrice = settingsStore.orderType === ORDER_TYPE.Market;
        const shouldSetDefaultLimitPrice =
          settingsStore.orderType === ORDER_TYPE.Limit &&
          this.inputPrice.isZero() &&
          this.activeInput !== ACTIVE_INPUT.Price;
        if (shouldSetMarketPrice || shouldSetDefaultLimitPrice || order.market === tradeStore.market?.contractAddress) {
          this.setInputPriceThrottle(order.price);
        }
      },
    );

    reaction(
      () => [this.isSell, settingsStore.orderType],
      ([isSell]) => {
        const orders = isSell ? spotOrderBookStore.buyOrders : spotOrderBookStore.sellOrders;
        const order = orders[orders.length - 1];

        if (!order) return;
        this.setInputPriceThrottle(order.price);
      },
    );

    reaction(
      () => tradeStore.market,
      () => {
        this.setInputAmount(BN.ZERO);
        this.setInputTotal(BN.ZERO);
        this.setInputPercent(0);
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

  get isSpotInputError(): boolean {
    const amount = this.isSell ? this.inputAmount : this.inputTotal;

    const totalBalance = this.getTotalBalanceWithFee();

    return totalBalance ? amount.gt(totalBalance) : false;
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

  private onSpotMaxClick = () => {
    const { tradeStore, mixPanelStore } = this.rootStore;

    if (!tradeStore.market) return;

    const totalBalance = this.getTotalBalanceWithFee();

    if (this.isSell) {
      this.setInputAmount(totalBalance);
      return;
    }

    mixPanelStore.trackEvent(MIXPANEL_EVENTS.CLICK_MAX_SPOT, {
      type: this.isSell ? "SELL" : "BUY",
      value: totalBalance.toString(),
    });

    this.setInputTotal(totalBalance);
  };

  setInputPrice = (price: BN) => {
    const { settingsStore } = this.rootStore;
    this.inputPrice = price;
    if (settingsStore.orderType !== ORDER_TYPE.Market) this.setActiveInput(ACTIVE_INPUT.Price);
    this.calculateInputs();
  };

  setInputSlippage = (slippage: BN) => {
    this.slippage = slippage;
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

    tradeStore.fetchTradeFeeDebounce(this.inputTotal.toString());
  }

  private updatePercent(): void {
    const { tradeStore } = this.rootStore;

    if (!tradeStore.market) return;

    const totalBalance = this.getTotalBalanceWithFee();

    if (totalBalance.isZero()) {
      this.inputPercent = BN.ZERO;
      return;
    }

    const percentageOfTotal = this.isSell
      ? BN.ratioOf(this.inputAmount, totalBalance)
      : BN.ratioOf(this.inputTotal, totalBalance);

    this.inputPercent = percentageOfTotal.gt(100) ? new BN(100) : percentageOfTotal.toDecimalPlaces(0);
  }

  setInputPriceThrottle = _.throttle(this.setInputPrice, PRICE_UPDATE_THROTTLE_INTERVAL);

  setInputPercent = (value: number | number[]) => (this.inputPercent = new BN(value.toString()));

  getTotalBalanceWithFee = () => {
    const { tradeStore, balanceStore } = this.rootStore;

    if (!tradeStore.market) return BN.ZERO;

    const isSell = this.mode === ORDER_MODE.SELL;

    if (isSell) {
      return balanceStore.getTotalBalance(tradeStore.market.baseToken.assetId);
    }

    const fee = getRealFee(tradeStore.market, tradeStore.matcherFee, tradeStore.exchangeFee, isSell);
    const totalFee = fee.exchangeFee.plus(fee.matcherFee);

    const balance = balanceStore.getTotalBalance(tradeStore.market.quoteToken.assetId);

    if (balance.eq(BN.ZERO)) return BN.ZERO;

    return balanceStore.getTotalBalance(tradeStore.market.quoteToken.assetId).minus(totalFee);
  };

  createOrder = async () => {
    const { tradeStore, notificationStore, balanceStore, mixPanelStore, settingsStore, accountStore } = this.rootStore;

    const { market } = tradeStore;
    const { timeInForce } = settingsStore;
    const bcNetwork = Blockchain.getInstance();

    if (!market) return;
    this.isLoading = true;

    const isBuy = this.mode === ORDER_MODE.BUY;
    const type = isBuy ? OrderType.Buy : OrderType.Sell;

    const fee = getRealFee(market, tradeStore.matcherFee, tradeStore.exchangeFee, !isBuy);

    const depositAmount = isBuy ? this.inputTotal : this.inputAmount;
    const feeAmount = fee.exchangeFee.plus(fee.matcherFee);

    const deposit: DepositInfo = {
      amountToSpend: depositAmount.toString(),
      amountFee: feeAmount.toString(),
    };

    const compactMarkets: CompactMarketInfo[] = CONFIG.MARKETS.map((m) => ({
      contractId: m.contractId,
      quoteAssetId: m.quoteAssetId,
      baseAssetId: m.baseAssetId,
    }));

    if (bcNetwork.sdk.getIsExternalWallet()) {
      notificationStore.info({ text: "Please, confirm operation in your wallet" });
    }

    try {
      let hash: Undefinable<string> = "";

      if (timeInForce === LimitType.GTC || timeInForce === LimitType.MKT) {
        hash = await this.createGTCOrder(type, deposit, compactMarkets, timeInForce);
      } else {
        hash = await this.createMarketOrLimitOrder(type, market, deposit, compactMarkets);
      }

      const token = isBuy ? market.baseToken : market.quoteToken;
      const amount = isBuy ? this.inputAmount : this.inputTotal;
      this.setInputTotal(BN.ZERO);
      mixPanelStore.trackEvent(MIXPANEL_EVENTS.CONFIRM_ORDER, {
        order_type: isBuy ? "BUY" : "SELL",
        token_1: market.baseToken.symbol,
        token_2: market.quoteToken.symbol,
        transaction_sum: BN.formatUnits(amount, token.decimals).toSignificant(2),
        user_address: accountStore.address,
      });
      notificationStore.success({
        text: getActionMessage(ACTION_MESSAGE_TYPE.CREATING_ORDER)(
          BN.formatUnits(amount, token.decimals).toSignificant(2),
          token.symbol,
          BN.formatUnits(this.inputPrice, DEFAULT_DECIMALS).toSignificant(2),
          isBuy ? "buy" : "sell",
        ),
        hash,
      });
    } catch (error: any) {
      const action =
        settingsStore.orderType === ORDER_TYPE.Market
          ? ACTION_MESSAGE_TYPE.CREATING_ORDER_FAILED
          : ACTION_MESSAGE_TYPE.CREATING_ORDER_FAILED_INSTRUCTION;
      handleWalletErrors(notificationStore, error, getActionMessage(action)());
    }

    await balanceStore.update();
    this.isLoading = false;
  };

  applySlippage = (value: BN, slippagePercent: BN, isPositive = true) => {
    const factor = new BN(1).plus(isPositive ? slippagePercent.div(100) : slippagePercent.div(100).negated());

    return value.multipliedBy(factor).decimalPlaces(0).toString();
  };

  // Extracted function for creating GTC orders with deposits
  private createGTCOrder = async (
    type: OrderType,
    deposit: DepositInfo,
    markets: CompactMarketInfo[],
    timeInForce: LimitType,
  ): Promise<string> => {
    const bcNetwork = Blockchain.getInstance();

    let price = this.inputPrice.toString();
    const amount = this.inputAmount.toString();

    let amountToSpend = deposit.amountToSpend;

    if (timeInForce === LimitType.MKT) {
      const isBuy = type === OrderType.Buy;
      price = this.applySlippage(this.inputPrice, this.slippage, isBuy);

      amountToSpend = isBuy
        ? this.applySlippage(new BN(amountToSpend), this.slippage.plus(1), isBuy)
        : amountToSpend.toString();
    }

    const order: CreateOrderWithDepositParams = {
      type,
      price,
      amount,
      ...deposit,
      amountToSpend,
    };

    const data = await bcNetwork.sdk.createSpotOrderWithDeposit(order, markets, timeInForce);
    return data.transactionId;
  };

  private createMarketOrLimitOrder = async (
    type: OrderType,
    market: SpotMarket,
    deposit: DepositInfo,
    markets: CompactMarketInfo[],
  ): Promise<string> => {
    const { settingsStore, tradeStore } = this.rootStore;
    const bcNetwork = Blockchain.getInstance();

    const isBuy = type === OrderType.Buy;

    const params: GetActiveOrdersParams = {
      limit: 50,
      market: [market.contractAddress],
      asset: market.baseToken.assetId ?? "",
      orderType: isBuy ? OrderType.Sell : OrderType.Buy,
    };

    const activeOrders = await bcNetwork.sdk.fetchSpotActiveOrders(params, {
      orderType: isBuy ? "desc" : "asc",
    });

    let orders: SpotMarketOrder[] = [];

    const formatOrder = (order: Order) =>
      new SpotMarketOrder({
        ...order,
        quoteAssetId: market.quoteToken.assetId,
      });

    if ("ActiveSellOrder" in activeOrders.data) {
      orders = activeOrders.data.ActiveSellOrder.map(formatOrder);
    } else {
      orders = activeOrders.data.ActiveBuyOrder.map(formatOrder);
    }

    let total = this.inputTotal;
    let spend = BN.ZERO;
    const orderList = orders
      .map((el) => {
        if (total.toNumber() < 0) {
          return null;
        }
        spend = spend.plus(el.currentAmount);
        total = total.minus(el.currentQuoteAmount);
        return el;
      })
      .filter((el) => el !== null);

    const price =
      settingsStore.orderType === ORDER_TYPE.Market
        ? orderList[orderList.length - 1].price.toString()
        : this.inputPrice.toString();

    if (!tradeStore.market) return "";

    const baseDecimals = tradeStore.market.baseToken.decimals;
    const quoteDecimals = tradeStore.market.quoteToken.decimals;
    const newInputTotal = this.inputTotal.minus(deposit.amountFee);
    const fullPrecent = "10000";
    const slippage =
      settingsStore.orderType === ORDER_TYPE.Market ? this.slippage.multipliedBy(100).toString() : fullPrecent;
    const newInputAmount = Math.divideWithDifferentDecimals(
      newInputTotal,
      quoteDecimals,
      this.inputPrice,
      DEFAULT_DECIMALS,
      baseDecimals,
    );

    const order: FulfillOrderManyWithDepositParams = {
      ...deposit,
      amountToSpend: newInputTotal.toString(),
      amount: newInputAmount.toString(),
      orderType: type,
      limitType: settingsStore.timeInForce,
      price,
      orders: orderList.map((el) => el.id),
      slippage: slippage,
    };
    const data = await bcNetwork.sdk.fulfillOrderManyWithDeposit(order, markets);
    return data.transactionId;
  };

  selectOrderbookOrder = async (order: SpotMarketOrder, mode: ORDER_MODE) => {
    const { settingsStore } = this.rootStore;
    settingsStore.setTimeInForce(LimitType.GTC);
    settingsStore.setOrderType(ORDER_TYPE.Limit);
    this.setOrderMode(mode);
    // setTimeout(() => {
    //   this.setInputPrice(order.price);
    // }, 50);
  };
}
