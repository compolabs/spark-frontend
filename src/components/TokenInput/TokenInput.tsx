import React, { CSSProperties, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import { BN } from "@compolabs/spark-orderbook-ts-sdk";

import Chip from "@components/Chip";
import Text, { TEXT_TYPES_MAP } from "@components/Text";
import { media } from "@themes/breakpoints";

import { FuelNetwork } from "@blockchain";

import AmountInput from "./AmountInput";
import { BigNumberInput } from "./BigNumberInput";

interface TokenInputProps {
  assetId?: string;
  decimals: number;
  displayDecimals?: number;
  label?: string;
  max?: BN;
  amount: BN;
  setAmount?: (amount: BN) => void;
  errorMessage?: string;
  error?: boolean;
  disabled?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  readOnly?: boolean;
  styleInputContainer?: CSSProperties;
  handleMaxBalance?: () => void;
  isShowMax?: boolean;
}

const TokenInput: React.FC<TokenInputProps> = observer((props) => {
  const bcNetwork = FuelNetwork.getInstance();

  const [focused, setFocused] = useState(false);
  const [amount, setAmount] = useState<BN>(props.amount);

  useEffect(() => {
    props.amount && setAmount(props.amount);
  }, [props.amount]);

  const handleChangeAmount = (v: BN) => {
    if (props.disabled) return;
    setAmount(v);
    props.setAmount?.(v);
  };

  return (
    <Root>
      {props.label && (
        <>
          <Text>{props.label}</Text>
        </>
      )}
      <InputContainer
        error={props.error}
        focused={focused}
        readOnly={!props.setAmount}
        style={props.styleInputContainer}
      >
        <BigNumberInput
          autofocus={focused}
          decimals={props.decimals}
          disabled={props.disabled}
          displayDecimals={props.displayDecimals}
          max={props.max?.toString()}
          placeholder="0.00"
          renderInput={(inputProps, ref) => (
            <AmountInput
              {...inputProps}
              disabled={props.disabled}
              inputRef={ref}
              onBlur={() => {
                props.onBlur?.();
                setFocused(false);
              }}
              onFocus={() => {
                props.onFocus?.();
                !props.readOnly && setFocused(true);
              }}
            />
          )}
          value={amount}
          onChange={handleChangeAmount}
        />
        {props.assetId && <Chip>{bcNetwork?.getTokenByAssetId(props.assetId).symbol}</Chip>}
        {props.isShowMax && <Chip onClick={props.handleMaxBalance}>MAX</Chip>}
      </InputContainer>
      {props.error && props.errorMessage && <ErrorText attention>{props.errorMessage}</ErrorText>}
    </Root>
  );
});

export default TokenInput;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  gap: 2px;

  position: relative;
`;

const InputContainer = styled.div<{
  focused?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  error?: boolean;
  disabled?: boolean;
}>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
  height: 40px;
  min-height: 32px;
  width: 100%;
  cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};

  input {
    cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};
    ${TEXT_TYPES_MAP.BODY}
  }

  background: ${({ theme }) => theme.colors.bgPrimary};

  border-radius: 4px;
  border: 1px solid
    ${({ error, focused, disabled, theme }) =>
      (() => {
        if (disabled) return theme.colors.borderSecondary;
        if (error) return theme.colors.attention;
        if (focused) return theme.colors.borderAccent;
        return theme.colors.borderSecondary;
      })()};

  ${media.mobile} {
    height: 32px;
  }
`;

const ErrorText = styled(Text)`
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
`;
