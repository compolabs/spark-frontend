import { arrayify, CoinQuantityLike, hashMessage } from "fuels";

// import { DEFAULT_DECIMALS } from "@src/constants";
// import { Token } from "@src/entity";
import BN from "@src/utils/BN";

import { AccountBalanceAbi__factory } from "./types/account-balance";
import { I64Input } from "./types/account-balance/AccountBalanceAbi";
import { ClearingHouseAbi__factory } from "./types/clearing-house";
import { OrderbookAbi__factory } from "./types/orderbook";
import { PerpMarketAbi__factory } from "./types/perp-market";
import { ProxyAbi__factory } from "./types/proxy";
import { PythContractAbi__factory } from "./types/pyth";
import { TokenAbi__factory } from "./types/src-20";
import { AssetIdInput, IdentityInput } from "./types/src-20/TokenAbi";
import { VaultAbi__factory } from "./types/vault";
import { DEFAULT_DECIMALS } from "./constants";
import { IOptions } from "./interface";

export class WriteActions {
  createSpotOrder = async (
    baseTokenAddress: string,
    quoteTokenAddress: string,
    size: string,
    price: string,
    options: IOptions,
  ): Promise<string> => {
    const orderbookFactory = OrderbookAbi__factory.connect(options.contractAddresses.spotMarket, options.wallet);

    const assetId: AssetIdInput = { value: baseTokenAddress };
    const isNegative = size.includes("-");
    const absSize = size.replace("-", "");
    const baseSize: I64Input = { value: absSize, negative: isNegative };

    const amountToSend = new BN(absSize)
      .times(price)
      .dividedToIntegerBy(new BN(10).pow(DEFAULT_DECIMALS + Number(baseTokenAddress) - Number(quoteTokenAddress)));

    const forward: CoinQuantityLike = {
      amount: isNegative ? absSize : amountToSend.toString(),
      assetId: isNegative ? baseTokenAddress : quoteTokenAddress,
    };

    const tx = await orderbookFactory.functions
      .open_order(assetId, baseSize, price)
      .callParams({ forward })
      .txParams({ gasPrice: options.gasPrice, gasLimit: options.gasLimit })
      .call();

    return tx.transactionId;
  };

  cancelSpotOrder = async (orderId: string, options: IOptions): Promise<void> => {
    const orderbookFactory = OrderbookAbi__factory.connect(options.contractAddresses.spotMarket, options.wallet);

    await orderbookFactory.functions
      .cancel_order(orderId)
      .txParams({ gasPrice: options.gasPrice, gasLimit: options.gasLimit })
      .call();
  };

  mintToken = async (tokenAddress: string, amount: string, options: IOptions): Promise<void> => {
    const tokenFactory = options.contractAddresses.tokenFactory;
    const tokenFactoryContract = TokenAbi__factory.connect(tokenFactory, options.wallet);

    const mintAmount = BN.parseUnits(amount, Number(tokenAddress));
    const hash = hashMessage(tokenAddress);
    const identity: IdentityInput = {
      Address: {
        value: options.wallet.address.toB256(),
      },
    };

    await tokenFactoryContract.functions
      .mint(identity, hash, mintAmount.toString())
      .txParams({ gasPrice: options.gasPrice, gasLimit: options.gasLimit })
      .call();
  };

  approve = async (assetAddress: string, amount: string): Promise<void> => {};

  allowance = async (assetAddress: string): Promise<string> => {
    return "";
  };

  depositPerpCollateral = async (assetAddress: string, amount: string, options: IOptions) => {
    const vaultFactory = VaultAbi__factory.connect(options.contractAddresses.vault, options.wallet);

    const assetIdInput: AssetIdInput = {
      value: assetAddress,
    };

    const forward: CoinQuantityLike = {
      assetId: assetAddress,
      amount,
    };

    await vaultFactory.functions
      .deposit_collateral(assetIdInput)
      .callParams({ forward })
      .txParams({ gasPrice: options.gasPrice, gasLimit: options.gasLimit })
      .call();
  };

  withdrawPerpCollateral = async (
    baseTokenAddress: string,
    gasTokenAddress: string,
    amount: string,
    updateData: string[],
    options: IOptions,
  ) => {
    const vaultFactory = VaultAbi__factory.connect(options.contractAddresses.vault, options.wallet);

    const assetIdInput: AssetIdInput = {
      value: baseTokenAddress,
    };

    const parsedUpdateData = updateData.map((v) => Array.from(arrayify(v)));

    const forward: CoinQuantityLike = {
      amount: "10",
      assetId: gasTokenAddress,
    };

    await vaultFactory.functions
      .withdraw_collateral(amount, assetIdInput, parsedUpdateData)
      .callParams({ forward })
      .txParams({ gasPrice: 1 })
      .addContracts([
        ProxyAbi__factory.connect(options.contractAddresses.proxy, options.wallet),
        PerpMarketAbi__factory.connect(options.contractAddresses.perpMarket, options.wallet),
        AccountBalanceAbi__factory.connect(options.contractAddresses.accountBalance, options.wallet),
        ClearingHouseAbi__factory.connect(options.contractAddresses.clearingHouse, options.wallet),
        VaultAbi__factory.connect(options.contractAddresses.vault, options.wallet),
        PythContractAbi__factory.connect(options.contractAddresses.pyth, options.wallet),
      ])
      .call();
  };

  openPerpOrder = async (
    baseTokenAddress: string,
    gasTokenAddress: string,
    amount: string,
    price: string,
    updateData: string[],
    options: IOptions,
  ): Promise<string> => {
    const clearingHouseFactory = ClearingHouseAbi__factory.connect(
      options.contractAddresses.clearingHouse,
      options.wallet,
    );

    const assetIdInput: AssetIdInput = {
      value: baseTokenAddress,
    };

    const isNegative = amount.includes("-");
    const absSize = amount.replace("-", "");
    const baseSize: I64Input = { value: absSize, negative: isNegative };

    const parsedUpdateData = updateData.map((v) => Array.from(arrayify(v)));

    const forward: CoinQuantityLike = {
      amount: "10",
      assetId: gasTokenAddress,
    };

    const tx = await clearingHouseFactory.functions
      .open_order(assetIdInput, baseSize, price, parsedUpdateData)
      .callParams({ forward })
      .txParams({ gasPrice: options.gasPrice, gasLimit: options.gasLimit })
      .addContracts([
        ProxyAbi__factory.connect(options.contractAddresses.proxy, options.wallet),
        PerpMarketAbi__factory.connect(options.contractAddresses.perpMarket, options.wallet),
        AccountBalanceAbi__factory.connect(options.contractAddresses.accountBalance, options.wallet),
        VaultAbi__factory.connect(options.contractAddresses.vault, options.wallet),
        PythContractAbi__factory.connect(options.contractAddresses.pyth, options.wallet),
      ])
      .call();
    return tx.transactionId;
  };

  removePerpOrder = async (orderId: string, options: IOptions): Promise<void> => {
    const clearingHouseFactory = ClearingHouseAbi__factory.connect(
      options.contractAddresses.clearingHouse,
      options.wallet,
    );

    await clearingHouseFactory.functions
      .remove_order(orderId)
      .txParams({ gasPrice: options.gasPrice, gasLimit: options.gasLimit })
      .addContracts([
        ProxyAbi__factory.connect(options.contractAddresses.proxy, options.wallet),
        PerpMarketAbi__factory.connect(options.contractAddresses.perpMarket, options.wallet),
        ClearingHouseAbi__factory.connect(options.contractAddresses.clearingHouse, options.wallet),
      ])
      .call();
  };

  fulfillPerpOrder = async (
    gasTokenAddress: string,
    orderId: string,
    amount: string,
    updateData: string[],
    options: IOptions,
  ) => {
    const clearingHouseFactory = ClearingHouseAbi__factory.connect(
      options.contractAddresses.clearingHouse,
      options.wallet,
    );

    const isNegative = amount.includes("-");
    const absSize = amount.replace("-", "");
    const baseSize: I64Input = { value: absSize, negative: isNegative };

    const parsedUpdateData = updateData.map((v) => Array.from(arrayify(v)));

    const forward: CoinQuantityLike = {
      amount: "10",
      assetId: gasTokenAddress,
    };

    await clearingHouseFactory.functions
      .fulfill_order(baseSize, orderId, parsedUpdateData)
      .callParams({ forward })
      .txParams({ gasPrice: options.gasPrice, gasLimit: options.gasLimit })
      .addContracts([
        ProxyAbi__factory.connect(options.contractAddresses.proxy, options.wallet),
        PerpMarketAbi__factory.connect(options.contractAddresses.perpMarket, options.wallet),
        AccountBalanceAbi__factory.connect(options.contractAddresses.accountBalance, options.wallet),
        ClearingHouseAbi__factory.connect(options.contractAddresses.clearingHouse, options.wallet),
        VaultAbi__factory.connect(options.contractAddresses.vault, options.wallet),
        PythContractAbi__factory.connect(options.contractAddresses.pyth, options.wallet),
      ])
      .call();
  };
}
