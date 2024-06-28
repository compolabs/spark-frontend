import { autorun, makeAutoObservable, reaction, toJS } from "mobx";

import { FuelNetwork } from "@src/blockchain";
import BN from "@src/utils/BN";

import RootStore from "./RootStore";
import { TokenOption } from "@src/screens/SwapScreen/TokenSelect";
import { parseNumberWithCommas } from "@src/utils/swapUtils";
import { DEFAULT_DECIMALS } from "@src/constants";
import { Undefinable } from "tsdef";
import { AssetType, GetOrdersParams, OrderType } from "@compolabs/spark-orderbook-ts-sdk";
import { createToast } from "@src/components/Toast";

class SwapStore {
  tokens: TokenOption[];
  sellToken: TokenOption;
  buyToken: TokenOption;
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
    this.sellToken = newTokens[0];
    this.buyToken = newTokens[1];
    this.buyTokenPrice = this.getPrice(this.buyToken);
    this.sellTokenPrice = this.getPrice(this.sellToken);
  }

  fetchNewTokens() {
    const { balanceStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    return bcNetwork!.getTokenList().map((v) => {
      const balance = balanceStore.getBalance(v.assetId);
      const formatBalance = BN.formatUnits(balance ?? BN.ZERO, v.decimals);
      const token = bcNetwork!.getTokenByAssetId(v.assetId);

      return {
        key: token.symbol,
        title: token.name,
        symbol: token.symbol,
        img: token.logo,
        balance: formatBalance?.toFormat(4),
        priceFeed: token.priceFeed,
        assetId: token.assetId,
      };
    });
  }

  swapTokens = async ({ slippage }: { slippage: number }) => {
    const { notificationStore, balanceStore } = this.rootStore;
    let hash: Undefinable<string> = "";
    const bcNetwork = FuelNetwork.getInstance();

    const params: GetOrdersParams = {
      limit: 200,
      asset: this.buyToken.assetId, // ? sellToken.assetId
      status: ["Active"],
    };

    // maybe we need to fetch all orders
    const [buy, sell] = await Promise.all([
      bcNetwork!.fetchSpotOrders({ ...params, orderType: OrderType.Buy }),
      bcNetwork!.fetchSpotOrders({ ...params, orderType: OrderType.Sell }),
    ]);

    const deposit = {
      amount: this.payAmount,
      asset: this.sellToken.symbol,
      // amount: this.mode === ORDER_MODE.BUY ? this.inputTotal.toString() : this.inputAmount.toString(),
      // asset: this.mode === ORDER_MODE.BUY ? market.quoteToken.assetId : market.baseToken.assetId,
    };

    // matchmanyparamas
    // amount
    // assetType
    // orderType
    // price
    // slippage
    // orders

    const order = {
      amount: this.receiveAmount,
      assetType: AssetType.Base,
      orderType: "Market",
      price: this.buyTokenPrice,
      slippage: "0.01",
      orders: [],
    };

    // const data = await bcNetwork.createSpotOrder(deposit, order);
    const data = {
      transactionId: "123",
    };

    hash = data.transactionId;

    notificationStore.toast(createToast({ text: "Order Created", hash: hash }), {
      type: "success",
    });

    // await balanceStore.update();
    // return hash?
  };

  setSellToken(token: TokenOption) {
    this.sellToken = token;
  }

  setBuyToken(token: TokenOption) {
    this.buyToken = token;
  }

  setPayAmount(value: string) {
    this.payAmount = value;
  }

  setReceiveAmount(value: string) {
    this.receiveAmount = value;
  }
}

export default SwapStore;
