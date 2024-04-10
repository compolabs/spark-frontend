import { CoinQuantityLike, hashMessage } from "fuels";

import { DEFAULT_DECIMALS } from "@src/constants";
import { Token } from "@src/entity";
import { FAUCET_AMOUNTS } from "@src/stores/FaucetStore";
import BN from "@src/utils/BN";

import { TOKENS_BY_ASSET_ID } from "../constants";
import { OrderbookAbi__factory, TokenAbi__factory } from "../sdk/types";
import { AssetIdInput, I64Input } from "../sdk/types/OrderbookAbi";
import { IdentityInput } from "../sdk/types/TokenAbi";

import { IOptions } from "./interface";

export class Api {
  createOrder = async (
    baseToken: Token,
    quoteToken: Token,
    size: string,
    price: string,
    options: IOptions,
  ): Promise<string> => {
    const orderbookFactory = OrderbookAbi__factory.connect(options.contractAddresses.spotMarket, options.wallet);

    const assetId: AssetIdInput = { value: baseToken.assetId };
    const isNegative = size.includes("-");
    const absSize = size.replace("-", "");
    const baseSize: I64Input = { value: absSize, negative: isNegative };

    const amountToSend = new BN(absSize)
      .times(price)
      .dividedToIntegerBy(new BN(10).pow(DEFAULT_DECIMALS + baseToken.decimals - quoteToken.decimals));

    const forward: CoinQuantityLike = {
      amount: isNegative ? absSize : amountToSend.toString(),
      assetId: isNegative ? baseToken.assetId : quoteToken.assetId,
    };

    const tx = await orderbookFactory.functions
      .open_order(assetId, baseSize, price)
      .callParams({ forward })
      .txParams({ gasPrice: 1 })
      .call();

    return tx.transactionId;
  };

  cancelOrder = async (orderId: string, options: IOptions): Promise<void> => {
    const orderbookFactory = OrderbookAbi__factory.connect(options.contractAddresses.spotMarket, options.wallet);

    await orderbookFactory.functions.cancel_order(orderId).txParams({ gasPrice: 1 }).call();
  };

  mintToken = async (assetAddress: string, options: IOptions): Promise<void> => {
    const tokenFactory = options.contractAddresses.tokenFactory;
    const tokenFactoryContract = TokenAbi__factory.connect(tokenFactory, options.wallet);

    const token = TOKENS_BY_ASSET_ID[assetAddress];
    const amount = BN.parseUnits(FAUCET_AMOUNTS[token.symbol].toString(), token.decimals);
    const hash = hashMessage(token.symbol);
    const identity: IdentityInput = {
      Address: {
        value: options.wallet.address.toB256(),
      },
    };

    await tokenFactoryContract.functions.mint(identity, hash, amount.toString()).txParams({ gasPrice: 1 }).call();
  };

  approve = async (assetAddress: string, amount: string): Promise<void> => {};

  allowance = async (assetAddress: string): Promise<string> => {
    return "";
  };
}
