import React, { PropsWithChildren, useMemo } from "react";
import { AssetType, OrderType } from "@compolabs/spark-orderbook-ts-sdk";
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
  loading = false;

  mode: ORDER_MODE = ORDER_MODE.BUY;

  activeInput: ACTIVE_INPUT = ACTIVE_INPUT.Amount;

  inputPrice: BN = BN.ZERO;
  inputAmount: BN = BN.ZERO;
  inputPercent: BN = BN.ZERO;
  inputTotal: BN = BN.ZERO;

  inputLeverage: BN = BN.ZERO;
  inputLeveragePercent: BN = BN.ZERO;

  maxPositionSize: PerpMaxAbsPositionSize = {
    shortSize: BN.ZERO,
    longSize: BN.ZERO,
  };

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    const { tradeStore, oracleStore, settingsStore, accountStore, collateralStore } = this.rootStore;

    reaction(
      () => oracleStore.prices,
      () => {
        const { orderType } = settingsStore;
        const token = tradeStore.market?.baseToken;
        const price = token?.priceFeed ? oracleStore.getTokenIndexPrice(token?.priceFeed) : BN.ZERO;

        if (orderType === ORDER_TYPE.Market) {
          this.setInputPriceDebounce(price, true);
        } else if (
          orderType === ORDER_TYPE.Limit &&
          this.inputPrice.eq(BN.ZERO) &&
          this.activeInput !== ACTIVE_INPUT.Price
        ) {
          this.setInputPriceDebounce(price);
        }
      },
    );

    reaction(
      () => [tradeStore.market, accountStore.address, Array.from(collateralStore.balances)],
      async () => {
        await this.getMaxPositionSize();
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
  }

  get canProceed() {
    return this.inputAmount.gt(0) && this.inputPrice.gt(0) && this.inputTotal.gt(0) && !this.isInputError;
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
    const balance = balanceStore.getBalance(token);
    return balance ? amount.gt(balance) : false;
  }

  get isSell(): boolean {
    return this.mode === ORDER_MODE.SELL;
  }

  setOrderMode = (mode: ORDER_MODE) => {
    this.mode = mode;

    this.setInputAmount(BN.ZERO);
    this.setInputTotal(BN.ZERO);
    this.setInputPercent(0);
  };

  onMaxClick = () => {
    const { tradeStore } = this.rootStore;

    if (tradeStore.isPerp) {
      this.onPerpMaxClick();
      return;
    }

    this.onSpotMaxClick();
  };

  private onSpotMaxClick = () => {
    const { tradeStore, balanceStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!tradeStore.market) return;

    const tokenId = this.isSell ? tradeStore.market.baseToken.assetId : tradeStore.market.quoteToken.assetId;

    let balance = balanceStore.getBalance(tokenId) ?? BN.ZERO;
    if (tokenId === bcNetwork!.getTokenBySymbol("ETH").assetId) {
      balance = balance.minus(HALF_GWEI);
    }

    if (this.isSell) {
      this.setInputAmount(balance, true);
      return;
    }

    this.setInputTotal(balance, true);
  };

  private onPerpMaxClick = async () => {
    const { tradeStore } = this.rootStore;

    if (!tradeStore.market) return;

    const leverageAmount = this.isSell ? this.maxPositionSize.shortSize : this.maxPositionSize.longSize;

    if (this.isSell) {
      this.setInputAmount(leverageAmount, true);
      return;
    }

    this.setInputAmount(leverageAmount, true);
  };

  getMaxPositionSize = async () => {
    const { tradeStore, accountStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    if (!tradeStore.market || !accountStore.isConnected || this.inputPrice.eq(BN.ZERO)) return;

    this.maxPositionSize = await bcNetwork!.fetchPerpMaxAbsPositionSize(
      accountStore.address!,
      tradeStore.market.baseToken.assetId,
      this.inputPrice.toString(),
    );
  };

  setInputPrice = (price: BN, sync?: boolean) => {
    const { tradeStore } = this.rootStore;

    if (!tradeStore.market) return;

    this.inputPrice = price;

    if (price.eq(0)) {
      this.setInputTotal(BN.ZERO);
      return;
    }

    if (!sync) return;

    const formattedPrice = BN.formatUnits(price, DEFAULT_DECIMALS);
    const formattedAmount = BN.formatUnits(this.inputAmount, tradeStore.market.baseToken.decimals);
    const formattedTotal = BN.formatUnits(this.inputTotal, tradeStore.market.quoteToken.decimals);

    if (this.activeInput === ACTIVE_INPUT.Amount || this.activeInput === ACTIVE_INPUT.Price) {
      const total = BN.parseUnits(formattedAmount.times(formattedPrice), tradeStore.market.quoteToken.decimals);
      this.setInputTotal(total);
    } else if (this.activeInput === ACTIVE_INPUT.Total) {
      const amount = BN.parseUnits(formattedTotal.div(formattedPrice), tradeStore.market.baseToken.decimals);
      this.setInputAmount(amount);
    }
  };

  setInputPriceDebounce = _.throttle(this.setInputPrice, PRICE_UPDATE_THROTTLE_INTERVAL);

  setInputAmount = (amount: BN, sync?: boolean) => {
    const { tradeStore, balanceStore } = this.rootStore;

    if (!tradeStore.market) return;

    this.inputAmount = amount.toDecimalPlaces(0);

    if (this.inputPrice.eq(BN.ZERO)) {
      this.inputTotal = BN.ZERO;
      return;
    }

    if (!sync) return;

    const formattedInputPrice = BN.formatUnits(this.inputPrice, DEFAULT_DECIMALS);
    const formattedAmount = BN.formatUnits(amount, tradeStore.market.baseToken.decimals);

    const total = BN.parseUnits(formattedAmount.times(formattedInputPrice), tradeStore.market.quoteToken.decimals);
    this.setInputTotal(total);

    const relativeToken = this.isSell ? tradeStore.market.baseToken : tradeStore.market.quoteToken;
    const balance = balanceStore.getBalance(relativeToken.assetId);
    if (balance.eq(BN.ZERO)) return;

    let percentageOfTotal = BN.ratioOf(total, balance);

    if (this.isSell) {
      percentageOfTotal = BN.ratioOf(amount, balance);
    }

    const inputPercent = percentageOfTotal.gt(100) ? 100 : percentageOfTotal.toDecimalPlaces(0).toNumber();
    this.setInputPercent(inputPercent);

    this.calculateLeverage();
  };

  setInputPercent = (value: number | number[]) => (this.inputPercent = new BN(value.toString()));

  setInputTotal = (total: BN, sync?: boolean) => {
    const { tradeStore, balanceStore } = this.rootStore;

    if (!tradeStore.market) return;

    this.inputTotal = total.toDecimalPlaces(0);

    if (this.inputPrice.eq(BN.ZERO)) {
      this.inputAmount = BN.ZERO;
      return;
    }

    if (!sync) return;

    const formattedInputPrice = BN.formatUnits(this.inputPrice, DEFAULT_DECIMALS);
    const formattedTotal = BN.formatUnits(total, tradeStore.market.quoteToken.decimals);

    const inputAmount = BN.parseUnits(formattedTotal.div(formattedInputPrice), tradeStore.market.baseToken.decimals);
    this.setInputAmount(inputAmount);

    const relativeToken = this.isSell ? tradeStore.market.baseToken : tradeStore.market.quoteToken;
    const balance = balanceStore.getBalance(relativeToken.assetId);
    if (balance.eq(BN.ZERO)) return;

    let percentageOfTotal = BN.ratioOf(total, balance);

    if (this.isSell) {
      percentageOfTotal = BN.ratioOf(this.inputAmount, balance);
    }

    const inputPercent = percentageOfTotal.gt(100) ? 100 : percentageOfTotal.toDecimalPlaces(0).toNumber();
    this.setInputPercent(inputPercent);

    this.calculateLeverage();
  };

  setInputLeverage = (value: BN) => (this.inputLeverage = value);
  setInputLeveragePercent = (value: BN | number | number[]) => (this.inputLeveragePercent = new BN(value.toString()));

  calculateLeverage = () => {
    let percentageLeverageOfMaxPosition =
      this.inputAmount.eq(BN.ZERO) || this.maxPositionSize.longSize.eq(BN.ZERO)
        ? BN.ZERO
        : BN.ratioOf(this.inputAmount, this.maxPositionSize.longSize);

    if (this.isSell) {
      percentageLeverageOfMaxPosition = BN.ratioOf(this.inputAmount, this.maxPositionSize.shortSize);
    }

    const leverage = percentageLeverageOfMaxPosition.toDecimalPlaces(0);
    const inputPercent = percentageLeverageOfMaxPosition.gt(100) ? 100 : leverage;

    this.setInputLeverage(leverage);
    this.setInputLeveragePercent(inputPercent);
  };

  createOrder = async () => {
    const { tradeStore, notificationStore, balanceStore } = this.rootStore;
    const { market } = tradeStore;
    const bcNetwork = FuelNetwork.getInstance();
    const ethBalance = balanceStore.getBalance(bcNetwork.getTokenBySymbol("ETH").assetId);

    if (ethBalance.isZero()) {
      notificationStore.toast(createToast({ text: "You have insufficient ETH balance" }), { type: "error" });
      return;
    }

    if (!market) return;

    this.setLoading(true);
    if (bcNetwork.getIsExternalWallet()) {
      notificationStore.toast(createToast({ text: "Please, confirm operation in your wallet" }), { type: "info" });
    }

    try {
      const type = this.mode === ORDER_MODE.BUY ? OrderType.Buy : OrderType.Sell;

      let hash: Undefinable<string> = "";
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
        const deposit = {
          amount: this.mode === ORDER_MODE.BUY ? this.inputTotal.toString() : this.inputAmount.toString(),
          asset: this.mode === ORDER_MODE.BUY ? market.quoteToken.assetId : market.baseToken.assetId,
        };

        const order = {
          amount: this.inputAmount.toString(),
          tokenType: AssetType.Base,
          price: this.inputPrice.toString(),
          type,
        };

        const data = await bcNetwork.createSpotOrder(deposit, order);
        hash = data.transactionId;
      }

      notificationStore.toast(createToast({ text: "Order Created", hash: hash }), {
        type: "success",
      });
    } catch (error: any) {
      console.error(error);
      handleWalletErrors(notificationStore, error, "We were unable to process your order at this time");
    }

    await balanceStore.update();

    this.setLoading(false);
  };

  selectOrderbookOrder = async (order: SpotMarketOrder, mode: ORDER_MODE) => {
    const { settingsStore, accountStore, balanceStore } = this.rootStore;
    const isBuyMode = mode === ORDER_MODE.BUY;

    settingsStore.setOrderType(ORDER_TYPE.Limit);
    this.setOrderMode(mode);
    this.setInputPrice(order.price);

    const assetId = isBuyMode ? order.quoteToken.assetId : order.baseToken.assetId;
    const orderSize = isBuyMode ? order.initialQuoteAmount : order.initialAmount;

    const amount = accountStore.isConnected ? BN.min(balanceStore.getBalance(assetId), orderSize) : orderSize;

    isBuyMode ? this.setInputTotal(amount, true) : this.setInputAmount(amount, true);
  };

  private setLoading = (l: boolean) => (this.loading = l);

  setActiveInput = (input?: ACTIVE_INPUT) => (this.activeInput = input === undefined ? ACTIVE_INPUT.Amount : input);
}
