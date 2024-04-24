import dayjs, { Dayjs } from "dayjs";
import { Address, isBech32 } from "fuels";
import { Nullable } from "tsdef";

import { BlockchainNetworkFactory } from "@src/blockchain/BlockchainNetworkFactory";
import { TOKENS_BY_SYMBOL } from "@src/blockchain/evm/constants";
import { DEFAULT_DECIMALS } from "@src/constants";
import BN from "@src/utils/BN";

import { Token } from "./Token";

interface SpotMarketTradeParams {
  id: string;
  baseToken: string;
  matcher: string;
  seller: string;
  buyer: string;
  tradeAmount: BN;
  price: BN;
  timestamp: number;
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

export class SpotMarketTrade {
  readonly id: SpotMarketTradeParams["id"];
  readonly baseToken: Token;
  readonly matcher: SpotMarketTradeParams["matcher"];
  readonly seller: SpotMarketTradeParams["seller"];
  readonly buyer: SpotMarketTradeParams["buyer"];
  readonly tradeAmount: SpotMarketTradeParams["tradeAmount"];
  readonly price: SpotMarketTradeParams["price"];
  readonly timestamp: Dayjs;
  readonly quoteToken = TOKENS_BY_SYMBOL.USDC; // TODO: Переписать, пробрасывать через аргументы
  readonly type: Nullable<"SELL" | "BUY"> = null;

  constructor(params: SpotMarketTradeParams) {
    const bcNetwork = BlockchainNetworkFactory.getInstance().currentInstance!;
    const baseToken = bcNetwork.getTokenByAssetId(params.baseToken);

    this.id = params.id;
    this.baseToken = baseToken;
    this.matcher = params.matcher;
    this.seller = params.seller;
    this.buyer = params.buyer;
    this.tradeAmount = params.tradeAmount;
    this.price = params.price;
    this.timestamp = dayjs.unix(params.timestamp);
    this.type = getType(this.buyer, this.seller, params.userAddress);
  }

  get formatPrice() {
    return BN.formatUnits(this.price, DEFAULT_DECIMALS).toSignificant(2);
  }

  get formatTradeAmount() {
    return BN.formatUnits(this.tradeAmount, this.baseToken.decimals).toSignificant(2);
  }

  get marketSymbol() {
    return `${this.baseToken.symbol}-${this.quoteToken.symbol}`;
  }
}
