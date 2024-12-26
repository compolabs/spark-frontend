import _ from "lodash";
import { makeAutoObservable, reaction } from "mobx";
import { Undefinable } from "tsdef";

import {
  AssetType,
  CreateOrderWithDepositParams,
  FulfillOrderManyWithDepositParams,
  GetActiveOrdersParams,
  LimitType,
  Order,
  OrderType,
} from "@compolabs/spark-orderbook-ts-sdk";

import { RootStore } from "@stores";
import { MIXPANEL_EVENTS } from "@stores/MixPanelStore";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";
import { ACTION_MESSAGE_TYPE, getActionMessage } from "@utils/getActionMessage";
import { CONFIG } from "@utils/getConfig";
import { getRealFee } from "@utils/getRealFee";
import { handleWalletErrors } from "@utils/handleWalletErrors";
import Math from "@utils/Math";

import { FuelNetwork } from "@blockchain";
import { SpotMarket, SpotMarketOrder } from "@entity";

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
  depositAssetId: string;
  feeAssetId: string;
  assetType: AssetType;
}

export class SpotCreateOrderStore {
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

    const { spotOrderBookStore, marketStore, settingsStore } = this.rootStore;

    // TODO: Fix the bug where the price doesn’t change when switching markets
    reaction(
      () => [spotOrderBookStore.allBuyOrders, spotOrderBookStore.allSellOrders],
      ([buyOrders, sellOrders]) => {
        const orders = this.isSell ? buyOrders : sellOrders;
        const order = orders[orders.length - 1];

        if (!order) return;

        const shouldSetMarketPrice = settingsStore.orderType === ORDER_TYPE.Market;
        const shouldSetDefaultLimitPrice =
          settingsStore.orderType === ORDER_TYPE.Limit &&
          this.inputPrice.isZero() &&
          this.activeInput !== ACTIVE_INPUT.Price;

        if (shouldSetMarketPrice || shouldSetDefaultLimitPrice) {
          this.setInputPriceThrottle(order.price);
        }
      },
    );

    reaction(
      () => [this.isSell, settingsStore.orderType],
      ([isSell]) => {
        const orders = isSell ? spotOrderBookStore.allBuyOrders : spotOrderBookStore.allSellOrders;
        const order = orders[orders.length - 1];

        if (!order) return;

        this.setInputPriceThrottle(order.price);
      },
    );

    reaction(
      () => marketStore.spotMarket,
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
    const { balanceStore, marketStore } = this.rootStore;

    if (!marketStore.spotMarket) return false;

    const amount = this.isSell ? this.inputAmount : this.inputTotal;
    const token = this.isSell ? marketStore.spotMarket.baseToken : marketStore.spotMarket.quoteToken;

    const totalBalance = balanceStore.getTotalBalance(token.assetId);

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
    const { mixPanelStore, balanceStore, marketStore } = this.rootStore;

    if (!marketStore.spotMarket) return;

    const token = this.isSell ? marketStore.spotMarket.baseToken : marketStore.spotMarket.quoteToken;

    const totalBalance = balanceStore.getTotalBalance(token.assetId);
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
    const { marketStore, spotMarketInfoStore } = this.rootStore;
    if (!marketStore.spotMarket) return;

    const baseDecimals = marketStore.spotMarket.baseToken.decimals;
    const quoteDecimals = marketStore.spotMarket.quoteToken.decimals;

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

    spotMarketInfoStore.fetchTradeFeeDebounce(this.inputTotal.toString());
  }

  private updatePercent(): void {
    const { balanceStore, marketStore } = this.rootStore;

    if (!marketStore.spotMarket) return;

    const token = this.isSell ? marketStore.spotMarket.baseToken : marketStore.spotMarket.quoteToken;

    const totalBalance = balanceStore.getTotalBalance(token.assetId);

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

  createOrder = async () => {
    const {
      marketStore,
      notificationStore,
      balanceStore,
      mixPanelStore,
      settingsStore,
      accountStore,
      spotMarketInfoStore,
    } = this.rootStore;

    const bcNetwork = FuelNetwork.getInstance();

    if (!marketStore.spotMarket) return;

    this.isLoading = true;

    const isBuy = this.mode === ORDER_MODE.BUY;
    const type = isBuy ? OrderType.Buy : OrderType.Sell;

    const fee = getRealFee(marketStore.market, spotMarketInfoStore.matcherFee, spotMarketInfoStore.exchangeFee, !isBuy);

    const depositAmount = isBuy ? this.inputTotal : this.inputAmount;
    const depositAmountWithFee = fee.exchangeFee.plus(fee.matcherFee);

    const deposit: DepositInfo = {
      amountToSpend: depositAmount.toString(),
      amountFee: depositAmountWithFee.toString(),
      depositAssetId: isBuy ? marketStore.spotMarket.quoteToken.assetId : marketStore.spotMarket.baseToken.assetId,
      feeAssetId: marketStore.spotMarket.quoteToken.assetId,
      assetType: isBuy ? AssetType.Quote : AssetType.Base,
    };

    const marketContractsByType = isBuy
      ? CONFIG.SPOT.MARKETS.filter((m) => m.quoteAssetId.toLowerCase() === deposit.feeAssetId.toLowerCase())
      : CONFIG.SPOT.MARKETS.filter((m) => m.baseAssetId.toLowerCase() === deposit.depositAssetId.toLowerCase());

    const marketContracts = marketContractsByType.map((m) => m.contractId);

    if (bcNetwork.getIsExternalWallet()) {
      notificationStore.info({ text: "Please, confirm operation in your wallet" });
    }

    try {
      let hash: Undefinable<string> = "";

      if (settingsStore.timeInForce === LimitType.GTC) {
        hash = await this.createGTCOrder(type, deposit, marketContracts);
      } else {
        hash = await this.createMarketOrLimitOrder(type, marketStore.spotMarket, deposit, marketContracts);
      }

      const token = isBuy ? marketStore.spotMarket.baseToken : marketStore.spotMarket.quoteToken;
      const amount = isBuy ? this.inputAmount : this.inputTotal;
      this.setInputTotal(BN.ZERO);
      mixPanelStore.trackEvent(MIXPANEL_EVENTS.CONFIRM_ORDER, {
        order_type: isBuy ? "BUY" : "SELL",
        token_1: marketStore.spotMarket.baseToken.symbol,
        token_2: marketStore.spotMarket.quoteToken.symbol,
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

  // Extracted function for creating GTC orders with deposits
  private createGTCOrder = async (
    type: OrderType,
    deposit: DepositInfo,
    marketContracts: string[],
  ): Promise<string> => {
    const bcNetwork = FuelNetwork.getInstance();

    const order: CreateOrderWithDepositParams = {
      type,
      amount: this.inputAmount.toString(),
      price: this.inputPrice.toString(),
      ...deposit,
    };

    const data = await bcNetwork.spotCreateOrderWithDeposit(order, marketContracts);
    return data.transactionId;
  };

  private createMarketOrLimitOrder = async (
    type: OrderType,
    market: SpotMarket,
    deposit: DepositInfo,
    marketContracts: string[],
  ): Promise<string> => {
    const { settingsStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    const isBuy = type === OrderType.Buy;

    const params: GetActiveOrdersParams = {
      limit: 50,
      market: [market.contractAddress],
      asset: market.baseToken.assetId ?? "",
      orderType: isBuy ? OrderType.Sell : OrderType.Buy,
    };

    const activeOrders = await bcNetwork.spotFetchActiveOrders(params);

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

    const baseDecimals = market.baseToken.decimals;
    const quoteDecimals = market.quoteToken.decimals;
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
    const data = await bcNetwork.spotFulfillOrderManyWithDeposit(order, marketContracts);
    return data.transactionId;
  };

  selectOrderbookOrder = async (order: SpotMarketOrder, mode: ORDER_MODE) => {
    const { settingsStore } = this.rootStore;
    settingsStore.setTimeInForce(LimitType.GTC);
    settingsStore.setOrderType(ORDER_TYPE.Limit);
    this.setOrderMode(mode);
    this.setInputPrice(order.price);
  };
}
