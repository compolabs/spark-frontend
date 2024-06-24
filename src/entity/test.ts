import { BN } from "@compolabs/spark-orderbook-ts-sdk";

import { DEFAULT_DECIMALS } from "@src/constants";

export const getQuoteAmount = (amount: string, price: string) => {
  const decimalsDiff = Math.abs(DEFAULT_DECIMALS - 8);
  const decimalsDiff2 = Math.abs(6 - 8);

  return new BN(amount)
    .multipliedBy(price)
    .multipliedBy(BN.parseUnits(1, decimalsDiff))
    .dividedBy(BN.parseUnits(1, DEFAULT_DECIMALS + decimalsDiff2));
};

(window as any).calc = getQuoteAmount;
