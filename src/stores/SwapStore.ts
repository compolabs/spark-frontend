import { autorun, makeAutoObservable, reaction } from "mobx";

import { AssetType, GetActiveOrdersParams, LimitType, Order, OrderType } from "@compolabs/spark-orderbook-ts-sdk";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";
import { ACTION_MESSAGE_TYPE, getActionMessage } from "@utils/getActionMessage";
import { CONFIG } from "@utils/getConfig";
import { handleWalletErrors } from "@utils/handleWalletErrors";
import { parseNumberWithCommas } from "@utils/swapUtils";

import { FuelNetwork } from "@blockchain";
import { SpotMarketOrder, Token } from "@entity";

import RootStore from "./RootStore";

class SwapStore {
  tokens: Token[];
  sellToken: Token;
  buyToken: Token;
  // maybe use BN
  payAmount: string;
  receiveAmount: string;
  buyTokenPrice: string;
  sellTokenPrice: string;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    this.tokens = this.fetchNewTokens();
    this.sellToken = this.tokens[0];
    this.buyToken = this.getTokenPair(this.tokens[0].assetId)[0];
    this.payAmount = "0.00";
    this.receiveAmount = "0.00";

    this.buyTokenPrice = this.getPrice(this.buyToken);
    this.sellTokenPrice = this.getPrice(this.sellToken);

    autorun(async () => {
      await this.initialize();
    });

    reaction(
      () => [this.payAmount, this.receiveAmount],
      () => {
        const { tradeStore } = this.rootStore;

        tradeStore.fetchTradeFeeDebounce(
          BN.parseUnits(
            this.isBuy() ? this.payAmount : this.receiveAmount,
            this.isBuy() ? this.sellToken.decimals : this.buyToken.decimals,
          ).toString(),
        );
      },
    );
  }

  async initialize() {
    await this.rootStore.balanceStore.initialize();
    this.updateTokens();
  }

  isBuy = () => {
    const { tradeStore } = this.rootStore;
    return tradeStore.market?.baseToken?.assetId === this.buyToken.assetId;
  };

  getTokenPair = (assetId: string) => {
    const { tradeStore } = this.rootStore;
    const markets = tradeStore.spotMarkets;
    const tokens = this.fetchNewTokens();
    return markets
      .map((market) => {
        const oppositeAssetId =
          market.quoteToken.assetId === assetId ? market.baseToken.assetId : market.quoteToken.assetId;

        return tokens.find((token) => token.assetId === oppositeAssetId);
      })
      .filter((tokenOption): tokenOption is Token => tokenOption !== undefined);
  };

  getPrice(token: Token): string {
    const { oracleStore } = this.rootStore;
    return token.priceFeed
      ? BN.formatUnits(oracleStore.getTokenIndexPrice(token.priceFeed), DEFAULT_DECIMALS).toFormat(2)
      : "0";
  }

  getMarketPair = (baseAsset: Token, quoteToken: Token) => {
    const { tradeStore } = this.rootStore;
    return tradeStore.spotMarkets.find(
      (el) =>
        (el.baseToken.assetId === baseAsset.assetId && el.quoteToken.assetId === quoteToken.assetId) ||
        (el.baseToken.assetId === quoteToken.assetId && el.quoteToken.assetId === baseAsset.assetId),
    );
  };

  updateTokens() {
    const newTokens = this.fetchNewTokens();
    this.tokens = newTokens;
    this.sellToken = newTokens.find((el) => el.assetId === this.sellToken.assetId) ?? newTokens[0];
    this.buyToken = newTokens.find((el) => el.assetId === this.buyToken.assetId) ?? newTokens[1];
    this.buyTokenPrice = this.getPrice(this.buyToken);
    this.sellTokenPrice = this.getPrice(this.sellToken);
  }

  fetchNewTokens(): Token[] {
    const bcNetwork = FuelNetwork.getInstance();

    return bcNetwork!.getTokenList().map((v) => {
      const token = bcNetwork!.getTokenByAssetId(v.assetId);
      return {
        name: token.name,
        symbol: token.symbol,
        logo: token.logo,
        priceFeed: token.priceFeed,
        assetId: token.assetId,
        decimals: token.decimals,
        precision: token.precision,
      };
    });
  }

  swapTokens = async ({ slippage }: { slippage: number }): Promise<boolean> => {
    const { notificationStore, tradeStore } = this.rootStore;

    if (!tradeStore.market) return false;

    const { baseToken, quoteToken } = tradeStore.market;
    const isBuy = baseToken?.assetId === this.buyToken.assetId;
    const bcNetwork = FuelNetwork.getInstance();
    const params: GetActiveOrdersParams = {
      limit: 50, // or more if needed
      market: [tradeStore.market.contractAddress],
      asset: baseToken?.assetId,
      orderType: !isBuy ? OrderType.Buy : OrderType.Sell,
    };

    const activeOrders = await bcNetwork!.fetchSpotActiveOrders(params);

    let orders: SpotMarketOrder[] = [];

    const formatOrder = (order: Order) =>
      new SpotMarketOrder({
        ...order,
        quoteAssetId: quoteToken.assetId,
      });

    if ("ActiveSellOrder" in activeOrders.data) {
      orders = activeOrders.data.ActiveSellOrder.map(formatOrder);
    } else {
      orders = activeOrders.data.ActiveBuyOrder.map(formatOrder);
    }

    // TODO: check if there is enough price sum to fulfill the order
    const formattedAmount = BN.parseUnits(this.payAmount, this.sellToken.decimals).toString();
    const formattedVolume = BN.parseUnits(this.receiveAmount, this.buyToken.decimals).toString();
    const depositAmountWithFee = tradeStore.exchangeFee.plus(this.rootStore.tradeStore.matcherFee);

    const pair = this.getMarketPair(this.buyToken, this.sellToken);
    if (!pair) return true;
    let total = new BN(isBuy ? formattedAmount : formattedVolume);
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

    const order = {
      orderType: isBuy ? OrderType.Buy : OrderType.Sell,
      amount: isBuy ? formattedVolume : formattedAmount,
      price: orderList[orderList.length - 1].price.toString(),
      amountToSpend: isBuy ? formattedVolume : formattedAmount,
      amountFee: depositAmountWithFee.toString(),
      depositAssetId: isBuy ? pair?.quoteToken.assetId : pair?.baseToken.assetId,
      feeAssetId: pair?.quoteToken.assetId,
      assetType: isBuy ? AssetType.Quote : AssetType.Base,
      limitType: LimitType.FOK,
      orders: orderList.map((el) => el.id),
      slippage: slippage.toString(),
    };

    const amountFormatted = BN.formatUnits(
      isBuy ? formattedVolume : formattedAmount,
      this.sellToken.decimals,
    ).toSignificant(2);

    const volumeFormatted = BN.formatUnits(
      isBuy ? formattedAmount : formattedVolume,
      this.sellToken.decimals,
    ).toSignificant(2);

    try {
      const marketContracts = CONFIG.MARKETS.map((el) => el.contractId);
      const tx = await bcNetwork.fulfillOrderManyWithDeposit(order, marketContracts);
      notificationStore.success({
        text: getActionMessage(ACTION_MESSAGE_TYPE.CREATING_SWAP)(
          amountFormatted,
          this.sellToken.symbol,
          volumeFormatted,
          this.buyToken.symbol,
        ),
        hash: tx.transactionId,
      });
      return true;
    } catch (error: any) {
      handleWalletErrors(
        notificationStore,
        error,
        getActionMessage(ACTION_MESSAGE_TYPE.CREATING_SWAP_FAILED)(
          amountFormatted,
          this.sellToken.symbol,
          volumeFormatted,
          this.buyToken.symbol,
        ),
      );
      return false;
    }
  };

  onSwitchTokens = () => {
    const sellTokenPrice = parseNumberWithCommas(this.sellTokenPrice);
    const buyTokenPrice = parseNumberWithCommas(this.buyTokenPrice);

    const tempToken = { ...this.sellToken };

    this.setSellToken(this.buyToken as Token);
    this.setBuyToken(tempToken as Token);

    this.setPayAmount(this.receiveAmount);

    const newReceiveAmount = Number(this.receiveAmount) * (buyTokenPrice / sellTokenPrice);
    this.setReceiveAmount(newReceiveAmount.toFixed(4));
  };

  setSellToken(token: Token) {
    this.sellToken = token;
    this.sellTokenPrice = this.getPrice(token);
  }

  setBuyToken(token: Token) {
    this.buyToken = token;
    this.buyTokenPrice = this.getPrice(token);
  }

  setPayAmount(value: string) {
    this.payAmount = value;
  }

  setReceiveAmount(value: string) {
    this.receiveAmount = value;
  }
}

export default SwapStore;
