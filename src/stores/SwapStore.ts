import {
  AssetType,
  FulfillOrderManyParams,
  GetOrdersParams,
  OrderType,
  WriteTransactionResponse,
} from "@compolabs/spark-orderbook-ts-sdk";
import { autorun, makeAutoObservable } from "mobx";
import { Undefinable } from "tsdef";

import { FuelNetwork } from "@src/blockchain";
import { DEFAULT_DECIMALS } from "@src/constants";
import { TokenOption } from "@src/screens/SwapScreen/TokenSelect";
import BN from "@src/utils/BN";
import { parseNumberWithCommas } from "@src/utils/swapUtils";

import RootStore from "./RootStore";
import { CatchClause } from "typescript";

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

  bcNetwork = FuelNetwork.getInstance();

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

  fetchNewTokens(): TokenOption[] {
    const { balanceStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    return bcNetwork!
      .getTokenList()
      .filter((token) => token.symbol !== "ETH")
      .map((v) => {
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
          decimals: token.decimals,
        };
      });
  }

  swapTokens = async ({ slippage }: { slippage: number }): Promise<WriteTransactionResponse> => {
    const { notificationStore, balanceStore, tradeStore } = this.rootStore;
    const hash: Undefinable<string> = "";
    const bcNetwork = FuelNetwork.getInstance();
    const isBuy = this.buyToken.symbol === "BTC"; // продумать если будет больше торговых пар, не будет работать
    console.log("sellToken", this.sellToken);
    console.log("buyToken", this.buyToken);
    const params: GetOrdersParams = {
      limit: 50, // or more if needed
      asset: isBuy ? this.buyToken.assetId : this.sellToken.assetId,
      status: ["Active"],
      orderType: !isBuy ? OrderType.Buy : OrderType.Sell,
    };

    const sellOrders = await bcNetwork!.fetchSpotOrders({
      ...params,
    });
    // TODO: check if there is enough price sum to fulfill the order

    console.log("sellOrders", sellOrders);
    console.log("orderType: !isBuy ? OrderType.Buy : OrderType.Sell,", !isBuy ? OrderType.Buy : OrderType.Sell);

    const formattedAmount = BN.parseUnits(this.payAmount, this.sellToken.decimals).toString();
    const deposit = {
      amount: formattedAmount,
      asset: isBuy ? this.buyToken.assetId : this.sellToken.assetId,
    };
    // const orders = [
    //   "0x23038d23bd5e014ab55de2862bba2a1e07ffd17e23bf08460b7d358b57ecdc0e",
    //   "0x9c535cf8c8d875a52abf46ade90805c295e1bf8dc7ae7d1fb20ec5072a85e869",
    //   "0x9421178addecb1d0bbe015b0364c51ad62f3a898f448900b7e82d849575f86ec",
    // ];
    // const deposit = {
    //   amount: "151554",
    //   asset: isBuy ? this.buyToken.assetId : this.sellToken.assetId,
    // };

    // const order: FulfillOrderManyParams = {
    //   amount: "151554",
    //   assetType: AssetType.Base,
    //   orderType: this.buyToken.symbol === "BTC" ? OrderType.Buy : OrderType.Sell,
    //   price: "65002770000000",
    //   orders: orders,
    //   slippage: "10000",
    // };

    // 65,002.00
    const order: FulfillOrderManyParams = {
      amount: formattedAmount,
      assetType: AssetType.Base,
      orderType: this.buyToken.symbol === "BTC" ? OrderType.Buy : OrderType.Sell,
      price: sellOrders[sellOrders.length - 1].price.toString(),
      orders: sellOrders.map((order) => order.id),
      slippage: slippage.toString(),
    };

    // notificationStore.toast(createToast({ text: "Order Created", hash: hash }), {
    //   type: "success",
    // });
    return await this.bcNetwork.swapTokens(deposit, order);
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
