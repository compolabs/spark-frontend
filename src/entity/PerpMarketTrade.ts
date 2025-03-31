import dayjs, { Dayjs } from "dayjs";
import { Nullable } from "tsdef";

import { DEFAULT_DECIMALS } from "@constants";

import { Blockchain } from "@blockchain";
import { BN } from "@blockchain/fuel/types";
import { Address, isBech32 } from "@blockchain/fuel/types/fuels";

import { Token } from "./Token";

interface PerpMarketTradeParams {
  baseToken: string;
  seller: string;
  buyer: string;
  tradeSize: string;
  tradePrice: string;
  sellOrderId: string;
  buyOrderId: string;
  timestamp: number;
  id?: string;
  userAddress?: string;
}

const getType = (buyer: string, seller: string, userAddress?: string) => {
  if (!userAddress) return null;

  const address = isBech32(userAddress) ? new Address(userAddress as `fuel${string}`).toB256() : userAddress;
  return address.toLowerCase() === seller.toLowerCase()
    ? "SELL"
    : address.toLowerCase() === buyer.toLowerCase()
      ? "BUY"
      : null;
};

export class PerpMarketTrade {
  readonly id: PerpMarketTradeParams["id"];
  readonly baseToken: Token;
  readonly seller: PerpMarketTradeParams["seller"];
  readonly buyer: PerpMarketTradeParams["buyer"];
  readonly sellOrderId: PerpMarketTradeParams["sellOrderId"];
  readonly buyOrderId: PerpMarketTradeParams["buyOrderId"];
  readonly tradeSize: PerpMarketTradeParams["tradeSize"];
  readonly tradePrice: PerpMarketTradeParams["tradePrice"];
  readonly timestamp: Dayjs;
  readonly type: Nullable<"SELL" | "BUY"> = null;

  constructor(params: PerpMarketTradeParams) {
    const bcNetwork = Blockchain.getInstance();
    const baseToken = bcNetwork.sdk.getTokenByAssetId(params.baseToken);

    this.id = params.id;
    this.baseToken = baseToken;
    this.seller = params.seller;
    this.buyer = params.buyer;
    this.sellOrderId = params.sellOrderId;
    this.buyOrderId = params.buyOrderId;
    this.tradeSize = params.tradeSize;
    this.tradePrice = params.tradePrice;
    this.timestamp = dayjs.unix(params.timestamp);
    this.type = getType(this.buyer, this.seller, params.userAddress);
  }

  get formatPrice() {
    return BN.formatUnits(this.tradePrice, DEFAULT_DECIMALS).toSignificant(2);
  }

  get formatTradeAmount() {
    return BN.formatUnits(this.tradeSize, this.baseToken.decimals).toSignificant(2);
  }

  // get marketSymbol() {
  //   return `${this.baseToken.symbol}-${this.quoteToken.symbol}`;
  // }
}
