import { BN } from "@blockchain/fuel/types";

import { SpotMarket } from "@entity";

//TODO: Delete this file and make refactor in perp branch
export const getRealFee = (market: SpotMarket | undefined, matcherFee: BN, exchangeFee: BN, isSell: boolean) => {
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
