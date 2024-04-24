import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import Chip from "@components/Chip";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { useStores } from "@src/stores";
import { media } from "@src/themes/breakpoints";
import BN from "@src/utils/BN";

import AmountInput from "./AmountInput";
import { BigNumberInput } from "./BigNumberInput";

interface IProps {
  assetId?: string;
  decimals: number;
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
}

const TokenInput: React.FC<IProps> = observer((props) => {
  const { blockchainStore } = useStores();
  const bcNetwork = blockchainStore.currentInstance;

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
      <InputContainer error={props.error} focused={focused} readOnly={!props.setAmount}>
        <BigNumberInput
          autofocus={focused}
          decimals={props.decimals}
          disabled={props.disabled}
          displayDecimals={props.decimals}
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
      </InputContainer>
      {props.error && (
        <>
          <Text>{props.errorMessage}</Text>
        </>
      )}
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

  box-sizing: border-box;

  input {
    cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};
    ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}
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
