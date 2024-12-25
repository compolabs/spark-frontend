import { BaseMarket } from "@entity";

import BN from "./BN";

//TODO: Delete this file and make refactor in perp branch
export const getRealFee = (market: BaseMarket | undefined, matcherFee: BN, exchangeFee: BN, isSell: boolean) => {
  if (!market || isSell) {
    return {
      matcherFee: BN.ZERO,
      matcherFeeFormat: BN.ZERO,
      exchangeFee: BN.ZERO,
      exchangeFeeFormat: BN.ZERO,
    };
  }

  const exchangeFeeFormat = BN.formatUnits(exchangeFee, market.quoteToken.decimals);
  const matcherFeeFormat = BN.formatUnits(matcherFee, market.quoteToken.decimals);

  return {
    matcherFee,
    matcherFeeFormat,
    exchangeFee,
    exchangeFeeFormat,
  };
};
