import React, { useMemo } from "react";

import BN from "@utils/BN";

interface PriceProps {
  value: number | string | BN;
  decimal: number;
  className?: string;
  currency?: string;
}

const MIN_VALUE = 1e-6;

export const PriceDisplay: React.FC<PriceProps> = ({ value, decimal, currency = "$", className }) => {
  const numericValue = useMemo(() => {
    if (typeof value === "string") {
      return new BN(value);
    }
    return new BN(value);
  }, [value]);

  const isSmallNumber = numericValue.lte(MIN_VALUE);

  if (isSmallNumber) {
    const formattedValue = numericValue.toFixed(10);
    const [integerPart, fractionalPart] = formattedValue.split(".");
    const firstSignificantDigitIndex = fractionalPart.search(/[1-9]/);
    const aaaa = firstSignificantDigitIndex - 1;

    return (
      <span className={className}>
        {currency}
        {integerPart}.0
        <span style={{ fontSize: "80%", verticalAlign: "sub" }}>{aaaa}</span>
        {fractionalPart.slice(aaaa)}
      </span>
    );
  }

  return numericValue.toSignificant(decimal);
};
