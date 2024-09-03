import {
  FulfillOrderManyParams,
  GetOrdersParams,
  LimitType,
  OrderType,
  WriteTransactionResponse,
} from "@compolabs/spark-orderbook-ts-sdk";
import { autorun, makeAutoObservable } from "mobx";

import { FuelNetwork } from "@src/blockchain";
import { DEFAULT_DECIMALS } from "@src/constants";
import { TokenOption } from "@src/screens/SwapScreen/TokenSelect";
import BN from "@src/utils/BN";
import { parseNumberWithCommas } from "@src/utils/swapUtils";

import RootStore from "./RootStore";
import { ACTION_MESSAGE_TYPE, getActionMessage } from "@src/utils/getActionMessage";
import { handleWalletErrors } from "@src/utils/handleWalletErrors";

class SwapStore {
  tokens: TokenOption[];
  sellToken: TokenOption;
  buyToken: TokenOption;
  // maybe use BN
  payAmount: string;
  receiveAmount: string;
  buyTokenPrice: string;
  sellTokenPrice: string;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    this.tokens = this.fetchNewTokens();
    this.sellToken = this.tokens[0];
    this.buyToken = this.tokens[1];
    this.payAmount = "0.00";
    this.receiveAmount = "0.00";

    this.buyTokenPrice = this.getPrice(this.buyToken);
    this.sellTokenPrice = this.getPrice(this.sellToken);

    autorun(async () => {
      await this.initialize();
    });
  }

  async initialize() {
    await this.rootStore.balanceStore.initialize();
    this.updateTokens();
  }

  getPrice(token: TokenOption): string {
    const { oracleStore } = this.rootStore;
    return token.priceFeed
      ? BN.formatUnits(oracleStore.getTokenIndexPrice(token.priceFeed), DEFAULT_DECIMALS).toFormat(2)
      : "0";
  }

  updateTokens() {
    const newTokens = this.fetchNewTokens();
    this.tokens = newTokens;
    this.sellToken = newTokens.find((el) => el.assetId === this.sellToken.assetId) ?? newTokens[0];
    this.buyToken = newTokens.find((el) => el.assetId === this.buyToken.assetId) ?? newTokens[1];
    this.buyTokenPrice = this.getPrice(this.buyToken);
    this.sellTokenPrice = this.getPrice(this.sellToken);
  }

  fetchNewTokens(): TokenOption[] {
    const { balanceStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    return bcNetwork!.getTokenList().map((v) => {
      const balance = balanceStore.getContractBalanceInfo(v.assetId).amount;
      const formatBalance = BN.formatUnits(balance ?? BN.ZERO, v.decimals);
      const token = bcNetwork!.getTokenByAssetId(v.assetId);

      return {
        key: token.symbol,
        title: token.name,
        symbol: token.symbol,
        img: token.logo,
        balance: formatBalance?.toFormat(v.precision),
        priceFeed: token.priceFeed,
        assetId: token.assetId,
        decimals: token.decimals,
        precision: token.precision,
      };
    });
  }

  swapTokens = async ({ slippage }: { slippage: number }): Promise<boolean> => {
    const { notificationStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();
    const ETH = bcNetwork.getTokenBySymbol("ETH");
    const isBuy = this.buyToken.symbol === "BTC"; // продумать если будет больше торговых пар, не будет работать
    const params: GetOrdersParams = {
      limit: 50, // or more if needed
      asset: isBuy ? this.buyToken.assetId : this.sellToken.assetId,
      status: ["Active"],
    };
    const sellOrders = await bcNetwork!.fetchSpotOrders({
      ...params,
      orderType: !isBuy ? OrderType.Buy : OrderType.Sell,
    });
    // TODO: check if there is enough price sum to fulfill the order

    const formattedAmount = BN.parseUnits(this.payAmount, this.sellToken.decimals).toString();
    const formattedVolume = BN.parseUnits(this.receiveAmount, this.buyToken.decimals).toString();

    const order: FulfillOrderManyParams = {
      amount: isBuy ? formattedVolume : formattedAmount,
      orderType: this.buyToken.symbol === "BTC" ? OrderType.Buy : OrderType.Sell,
      limitType: LimitType.FOK,
      price: sellOrders[sellOrders.length - 1].price.toString(),
      orders: sellOrders.map((el) => el.id),
      slippage: slippage.toString(),
      feeAssetId: ETH.assetId,
    };
    const amountFormatted = BN.formatUnits(
      isBuy ? formattedVolume : formattedAmount,
      this.sellToken.decimals,
    ).toSignificant(2);

    try {
      const tx = await bcNetwork.swapTokens(order);
      notificationStore.success({
        text: getActionMessage(ACTION_MESSAGE_TYPE.SWAP_TOKENS)(amountFormatted, this.sellToken.symbol),
        hash: tx.transactionId,
      });
      return true;
    } catch (error: any) {
      handleWalletErrors(
        notificationStore,
        error,
        getActionMessage(ACTION_MESSAGE_TYPE.SWAP_TOKENS_FAILED)(amountFormatted, this.sellToken.symbol),
      );
      return false;
    }
  };

  onSwitchTokens = () => {
    const sellTokenPrice = parseNumberWithCommas(this.sellTokenPrice);
    const buyTokenPrice = parseNumberWithCommas(this.buyTokenPrice);

    const tempToken = { ...this.sellToken };

    this.setSellToken(this.buyToken as TokenOption);
    this.setBuyToken(tempToken as TokenOption);

    this.setPayAmount(this.receiveAmount);

    const newReceiveAmount = Number(this.receiveAmount) * (buyTokenPrice / sellTokenPrice);
    this.setReceiveAmount(newReceiveAmount.toFixed(4));
  };

  setSellToken(token: TokenOption) {
    this.sellToken = token;
    this.sellTokenPrice = this.getPrice(token);
  }

  setBuyToken(token: TokenOption) {
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
