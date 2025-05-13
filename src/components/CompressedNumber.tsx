import React, { useMemo } from "react";

import { BN } from "@blockchain/fuel/types";

import { SmartFlex } from "./SmartFlex";
import Text from "./Text";
import Tooltip from "./Tooltip";

interface FormatUnit {
  threshold: number;
  divisor: number;
  suffix: string;
}

const defaultUnits: FormatUnit[] = [
  { threshold: 1e9, divisor: 1e9, suffix: "b" },
  { threshold: 1e6, divisor: 1e6, suffix: "m" },
  { threshold: 1e3, divisor: 1e3, suffix: "k" },
  { threshold: 0, divisor: 1, suffix: "" },
];

interface CompressedNumberProps {
  value: BN | number | string;
  precision?: number;
  compact?: boolean;
}

export const CompressedNumber: React.FC<CompressedNumberProps> = ({ value, precision = 4, compact }) => {
  const strValue = useMemo(() => {
    if (value instanceof BN) {
      return value.toString();
    }
    return typeof value === "number" ? value.toString() : value;
  }, [value]);

  const valueBN = new BN(strValue);

  const [integerPart, fractionalPart = ""] = strValue.split(".");

  const isIntegerZero = integerPart === "0";

  if (isIntegerZero && fractionalPart[0] === "0") {
    const withoutLastDigits = fractionalPart.substring(0, fractionalPart.length - 2);
    const match = withoutLastDigits.match(/^0+/);
    const leadingZeros = match ? match[0].length : 0;

    if (leadingZeros >= 4) {
      return (
        <TinyTooltip tooltipValue={valueBN.toFormat()}>
          <span>
            {integerPart}.0
            <span
              style={{
                fontSize: "0.8em",
                verticalAlign: "sub",
                margin: "0 1px",
              }}
            >
              {leadingZeros}
            </span>
            {fractionalPart.substring(leadingZeros, leadingZeros + 2)}
          </span>
        </TinyTooltip>
      );
    }
  }

  if (compact && !isIntegerZero) {
    const absValue = valueBN.abs();
    let formatted = absValue.toFixed(2, BN.ROUND_UP);

    for (const unit of defaultUnits) {
      if (absValue.gte(unit.threshold)) {
        formatted = `${absValue.div(unit.divisor).toFixed(2, BN.ROUND_UP)}${unit.suffix}`;
        break;
      }
    }
    return (
      <TinyTooltip tooltipValue={valueBN.toFormat()}>
        <span>{formatted}</span>
      </TinyTooltip>
    );
  }

  if (isIntegerZero) {
    return (
      <TinyTooltip tooltipValue={valueBN.toFormat()}>
        <span>{valueBN.toFixed(precision, BN.ROUND_UP)}</span>
      </TinyTooltip>
    );
  }

  return (
    <TinyTooltip tooltipValue={valueBN.toFormat()}>
      <span>{valueBN.toFixed(2, BN.ROUND_UP)}</span>
    </TinyTooltip>
  );
};

interface TinyTooltipProps {
  tooltipValue: string;
  children: React.ReactNode;
}

const TinyTooltip: React.FC<TinyTooltipProps> = ({ tooltipValue, children }) => {
  return (
    <Tooltip
      config={{
        placement: "right-start",
        trigger: "hover",
      }}
      containerStyles={{ width: "fit-content" }}
      content={
        <SmartFlex padding="4px">
          <Text type="SUPPORTING_NUMBERS">{tooltipValue}</Text>
        </SmartFlex>
      }
    >
      {children}
    </Tooltip>
  );
};
