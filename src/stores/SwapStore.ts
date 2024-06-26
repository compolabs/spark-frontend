import { autorun, makeAutoObservable, reaction, toJS } from "mobx";

import { FuelNetwork } from "@src/blockchain";
import BN from "@src/utils/BN";

import RootStore from "./RootStore";
import { TokenOption } from "@src/screens/SwapScreen/TokenSelect";
import { parseNumberWithCommas } from "@src/utils/swapUtils";
import { DEFAULT_DECIMALS } from "@src/constants";

class SwapStore {
  tokens: TokenOption[];
  sellToken: TokenOption;
  buyToken: TokenOption;
  payAmount: string;
  receiveAmount: string;
  buyTokenPrice: string;
  sellTokenPrice: string;

  constructor(private rootStore: RootStore) {
    const { oracleStore } = this.rootStore;
    makeAutoObservable(this);

    this.tokens = this.fetchNewTokens();
    this.sellToken = this.tokens[0];
    this.buyToken = this.tokens[1];
    this.payAmount = "0.00";
    this.receiveAmount = "0.00";

    this.buyTokenPrice = this.buyToken.priceFeed
      ? BN.formatUnits(oracleStore.getTokenIndexPrice(this.buyToken.priceFeed), DEFAULT_DECIMALS).toFormat(2)
      : "0";

    console.log(this.buyTokenPrice, "this.buyTokenPrice");
    console.log(BN.formatUnits(oracleStore.getTokenIndexPrice(this.buyToken.priceFeed), DEFAULT_DECIMALS).toFormat(2));

    this.sellTokenPrice = this.sellToken.priceFeed
      ? BN.formatUnits(oracleStore.getTokenIndexPrice(this.sellToken.priceFeed), DEFAULT_DECIMALS).toFormat(2)
      : "0";

    console.log(this.sellTokenPrice);

    reaction(
      () => [this.payAmount],
      () => {
        console.log(parseNumberWithCommas(this.sellTokenPrice.toString()), "reaction");
        // const receiveAmount =
        //   Number(this.payAmount) *
        //   (parseNumberWithCommas(this.sellTokenPrice.toString()) / parseNumberWithCommas(this.buyTokenPrice));

        // this.setReceiveAmount(receiveAmount.toFixed(2));
      },
    );

    autorun(() => {
      this.updateTokens();
    });
  }

  updateTokens() {
    const newTokens = this.fetchNewTokens();
    this.tokens = newTokens;
    this.sellToken = newTokens[0];
    this.buyToken = newTokens[1];
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
      };
    });
  }

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
