import { AssetType, GetOrdersParams, LimitType, OrderType } from "@compolabs/spark-orderbook-ts-sdk";
import { autorun, makeAutoObservable, reaction } from "mobx";

import { FuelNetwork } from "@src/blockchain";
import { DEFAULT_DECIMALS } from "@src/constants";
import BN from "@src/utils/BN";
import { parseNumberWithCommas } from "@src/utils/swapUtils";

import RootStore from "./RootStore";
import { ACTION_MESSAGE_TYPE, getActionMessage } from "@src/utils/getActionMessage";
import { handleWalletErrors } from "@src/utils/handleWalletErrors";
import _ from "lodash";
import { CONFIG } from "@src/utils/getConfig.ts";
import { Token } from "@src/entity";

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
        this.fetchExchangeFeeDebounce(
          BN.parseUnits(
            this.isBuy() ? this.payAmount : this.receiveAmount,
            this.isBuy() ? this.sellToken.decimals : this.buyToken.decimals,
          ).toString(),
        );
      },
    );
  }

  get exchangeFee(): BN {
    const { tradeStore } = this.rootStore;
    const { makerFee, takerFee } = tradeStore.tradeFee;

    return BN.max(makerFee, takerFee);
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

  fetchExchangeFee = (total: string) => {
    const { tradeStore } = this.rootStore;
    tradeStore.fetchTradeFee(total);
  };

  fetchExchangeFeeDebounce = _.debounce(this.fetchExchangeFee, 250);

  swapTokens = async ({ slippage }: { slippage: number }): Promise<boolean> => {
    const { notificationStore, tradeStore } = this.rootStore;
    const baseToken = tradeStore.market?.baseToken;
    const isBuy = baseToken?.assetId === this.buyToken.assetId;
    const bcNetwork = FuelNetwork.getInstance();
    const params: GetOrdersParams = {
      limit: 50, // or more if needed
      asset: baseToken?.assetId,
      status: ["Active"],
    };

    const sellOrders = await bcNetwork!.fetchSpotOrders({
      ...params,
      orderType: !isBuy ? OrderType.Buy : OrderType.Sell,
    });
    // TODO: check if there is enough price sum to fulfill the order
    const formattedAmount = BN.parseUnits(this.payAmount, this.sellToken.decimals).toString();
    const formattedVolume = BN.parseUnits(this.receiveAmount, this.buyToken.decimals).toString();
    const decimalToken = isBuy ? this.buyToken.decimals : this.sellToken.decimals;
    const depositAmountWithFee = BN.parseUnits(this.exchangeFee, decimalToken).plus(
      BN.parseUnits(this.rootStore.tradeStore.matcherFee, decimalToken),
    );

    // {
    //   "type": "Sell",
    //   "amount": "17216",
    //   "price": "58081620389280",
    //   "amountToSpend": "17216",
    //   "amountFee": "15999",
    //   "depositAssetId": "0x38e4ca985b22625fff93205e997bfc5cc8453a953da638ad297ca60a9f2600bc",
    //   "feeAssetId": "0x336b7c06352a4b736ff6f688ba6885788b3df16e136e95310ade51aa32dc6f05",
    //   "assetType": "Base"
    // }
    const pair = this.getMarketPair(this.buyToken, this.sellToken);
    console.log("pair", pair);
    if (!pair) return true;
    const order = {
      type: isBuy ? OrderType.Buy : OrderType.Sell,
      amount: isBuy ? formattedVolume : formattedAmount,
      price: sellOrders[sellOrders.length - 1].price.toString(),
      amountToSpend: isBuy ? formattedAmount : formattedVolume,
      amountFee: depositAmountWithFee.toString(),
      depositAssetId: pair?.baseToken.assetId,
      feeAssetId: pair?.quoteToken.assetId,
      assetType: isBuy ? AssetType.Quote : AssetType.Base,
      limitType: LimitType.FOK,
      orders: sellOrders.map((el) => el.id),
      slippage: slippage.toString(),
    };

    console.log("order", order);

    const amountFormatted = BN.formatUnits(
      isBuy ? formattedVolume : formattedAmount,
      this.sellToken.decimals,
    ).toSignificant(2);

    const volumeFormatted = BN.formatUnits(
      isBuy ? formattedAmount : formattedVolume,
      this.sellToken.decimals,
    ).toSignificant(2);

    try {
      const marketContracts = CONFIG.APP.markets.map((el) => el.contractId);
      const tx = await bcNetwork.createSpotOrderWithDeposit(order, marketContracts);
      notificationStore.success({
        text: getActionMessage(ACTION_MESSAGE_TYPE.CREATING_SWAP)(
          amountFormatted,
          this.sellToken.symbol,
          volumeFormatted,
          this.buyToken.symbol,
        ),
        hash: "tx.transactionId,",
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

  getSmartContractBalance = () => {
    const { balanceStore } = this.rootStore;
    return CONFIG.APP.markets
      .flatMap((market) => {
        const marketBalance = balanceStore.myMarketBalanceList[market.contractId];
        return [
          {
            assetId: market.baseAssetId,
            balance: new BN(marketBalance?.liquid?.base ?? 0),
          },
          {
            assetId: market.quoteAssetId,
            balance: new BN(marketBalance?.liquid?.quote ?? 0),
          },
        ];
      })
      .reduce(
        (acc, { assetId, balance }) => {
          if (!acc[assetId]) {
            acc[assetId] = BN.ZERO;
          }
          acc[assetId] = acc[assetId].plus(balance);
          return acc;
        },
        {} as Record<string, BN>,
      );
  };

  getFormatedContractBalance = () => {
    const data = this.getSmartContractBalance();
    if (Object.keys(data).length === 0) return [];
    const formatedBalance = [];
    const bcNetwork = FuelNetwork.getInstance();
    const { balanceStore } = this.rootStore;
    for (const assetId in data) {
      const token = bcNetwork!.getTokenByAssetId(assetId);
      const balance = balanceStore.balances.get(assetId) ?? BN.ZERO;
      const totalBalance = data[assetId].plus(balance);
      formatedBalance.push({
        asset: token,
        walletBalance: BN.formatUnits(balance, token.decimals).toString(),
        contractBalance: BN.formatUnits(data[assetId], token.decimals).toString(),
        balance: BN.formatUnits(totalBalance, token.decimals).toString(),
        assetId,
      });
    }
    return formatedBalance;
  };
}

export default SwapStore;
