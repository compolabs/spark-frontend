import React, { PropsWithChildren, useMemo } from "react";
import {
  AssetType,
  CreateOrderWithDepositParams,
  FulfillOrderManyWithDepositParams,
  GetOrdersParams,
  LimitType,
  OrderType,
} from "@compolabs/spark-orderbook-ts-sdk";
import _ from "lodash";
import { makeAutoObservable, reaction } from "mobx";
import { Undefinable } from "tsdef";

import { FuelNetwork } from "@src/blockchain";
import { DEFAULT_DECIMALS } from "@src/constants";
import { SpotMarket, SpotMarketOrder } from "@src/entity";
import useVM from "@src/hooks/useVM";
import { RootStore, useStores } from "@src/stores";
import BN from "@src/utils/BN";
import { ACTION_MESSAGE_TYPE, getActionMessage } from "@src/utils/getActionMessage";
import { CONFIG } from "@src/utils/getConfig";
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

interface DepositInfo {
  amountToSpend: string;
  amountFee: string;
  depositAssetId: string;
  feeAssetId: string;
  assetType: AssetType;
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
        const { spotOrderBookStore } = this.rootStore;
        const order = this.isSell
          ? spotOrderBookStore.buyOrders[0]
          : spotOrderBookStore.sellOrders[spotOrderBookStore.sellOrders.length - 1];
        if (orderType === ORDER_TYPE.Market) {
          this.setInputPriceThrottle(order.price);
        } else if (
          orderType === ORDER_TYPE.Limit &&
          this.inputPrice.isZero() &&
          this.activeInput !== ACTIVE_INPUT.Price
        ) {
          this.setInputPriceThrottle(order.price);
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
        const { swapStore } = this.rootStore;
        swapStore.fetchExchangeFeeDebounce(total.toString());
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
    const activeToken = balanceStore.getFormatedContractBalance().find((el) => el.assetId === token);
    if (!activeToken) return false;
    const balance = BN.parseUnits(activeToken.balance, activeToken.asset.decimals);
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
    const { tradeStore, mixPanelStore, balanceStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!tradeStore.market) return;

    const { assetId } = this.isSell ? tradeStore.market.baseToken : tradeStore.market.quoteToken;
    const tokenList = balanceStore.getFormatedContractBalance();
    const findToken = tokenList.find((el) => el.assetId === assetId);
    if (!findToken) return;
    let balance = BN.parseUnits(findToken.balance, findToken.asset.decimals);
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
    const activeToken = balanceStore.getFormatedContractBalance().find((el) => el.assetId === assetId);
    if (!activeToken) return;
    const balance = BN.parseUnits(activeToken.balance, activeToken.asset.decimals);

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
    const { tradeStore, notificationStore, balanceStore, mixPanelStore, settingsStore } = this.rootStore;

    const { market } = tradeStore;
    const { timeInForce } = settingsStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!market) return;
    this.isLoading = true;

    const isBuy = this.mode === ORDER_MODE.BUY;
    const type = isBuy ? OrderType.Buy : OrderType.Sell;

    const depositAmount = isBuy ? this.inputTotal : this.inputAmount;
    const depositAmountWithFee = BN.parseUnits(this.exchangeFee, market.quoteToken.decimals).plus(
      BN.parseUnits(tradeStore.matcherFee, market.quoteToken.decimals),
    );

    const deposit: DepositInfo = {
      amountToSpend: depositAmount.toString(),
      amountFee: depositAmountWithFee.toString(),
      depositAssetId: isBuy ? market.quoteToken.assetId : market.baseToken.assetId,
      feeAssetId: market.quoteToken.assetId,
      assetType: isBuy ? AssetType.Quote : AssetType.Base,
    };

    const marketContracts = CONFIG.APP.markets
      .filter(
        (m) =>
          m.baseAssetId.toLowerCase() === deposit.depositAssetId.toLowerCase() ||
          m.quoteAssetId.toLowerCase() === deposit.depositAssetId.toLowerCase(),
      )
      .map((m) => m.contractId);

    if (bcNetwork.getIsExternalWallet()) {
      notificationStore.info({ text: "Please, confirm operation in your wallet" });
    }

    try {
      let hash: Undefinable<string> = "";

      if (timeInForce === LimitType.GTC) {
        hash = await this.createGTCOrder(type, deposit, marketContracts);
      } else {
        hash = await this.createMarketOrLimitOrder(type, market, deposit, marketContracts);
      }

      const token = isBuy ? market.baseToken : market.quoteToken;
      const amount = isBuy ? this.inputAmount : this.inputTotal;

      notificationStore.success({
        text: getActionMessage(ACTION_MESSAGE_TYPE.CREATING_ORDER)(
          BN.formatUnits(amount, token.decimals).toSignificant(2),
          token.symbol,
          BN.formatUnits(this.inputPrice, DEFAULT_DECIMALS).toSignificant(2),
          isBuy ? "buy" : "sell",
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

    const data = await bcNetwork.createSpotOrderWithDeposit(order, marketContracts);
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

    const params: GetOrdersParams = {
      limit: 50,
      asset: market.baseToken.assetId ?? "",
      status: ["Active"],
    };
    const isBuy = type === OrderType.Buy;

    const oppositeOrderType = isBuy ? OrderType.Sell : OrderType.Buy;
    const orders = await bcNetwork.fetchSpotOrders({ ...params, orderType: oppositeOrderType });
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

    deposit = {
      ...deposit,
    };

    const order: FulfillOrderManyWithDepositParams = {
      amount: this.inputAmount.toString(),
      orderType: type,
      limitType: settingsStore.timeInForce,
      price,
      orders: orderList.map((el) => el.id),
      slippage: "10000",
      ...deposit,
    };
    const data = await bcNetwork.fulfillOrderManyWithDeposit(order, marketContracts);
    return data.transactionId;
  };

  selectOrderbookOrder = async (order: SpotMarketOrder, mode: ORDER_MODE) => {
    const { settingsStore } = this.rootStore;

    settingsStore.setOrderType(ORDER_TYPE.Limit);
    this.setOrderMode(mode);
    this.setInputPrice(order.price);
  };
}
