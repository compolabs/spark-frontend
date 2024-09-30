import React, { HTMLAttributes, useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import Button from "@components/Button";
import { IAssetBlock } from "@components/SelectAssets/AssetBlock";
import { SmartFlex } from "@components/SmartFlex";
import { BigNumberInput } from "@components/TokenInput/BigNumberInput";

import { TokenSelect } from "@screens/SwapScreen/TokenSelect";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";

import { Token } from "@entity";

import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "../Text";

export interface AssetBlockData {
  asset: Token;
  walletBalance: string;
  contractBalance: string;
  balance: string;
  assetId: string;
  price?: string;
}

interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  selected?: string;
  onSelect: (option: AssetBlockData, index: number) => void;
  onChangeValue: (value: BN) => void;
  label?: string;
  dataAssets: AssetBlockData[];
  showBalance: IAssetBlock["options"]["showBalance"];
  amount: BN;
  decimals?: number;
}

const presentData = [
  {
    text: "25%",
    value: 25,
  },
  {
    text: "50%",
    value: 50,
  },
  {
    text: "75%",
    value: 75,
  },
  {
    text: "Max",
    value: 100,
  },
];

const SelectAssetsInput = ({
  showBalance,
  selected,
  onSelect,
  label,
  dataAssets,
  onChangeValue,
  amount,
  decimals = DEFAULT_DECIMALS,
}: IProps) => {
  const theme = useTheme();
  const selectedOption = dataAssets.find(({ assetId }) => selected === assetId);
  const [selectPresent, setSelectPresent] = useState(0);

  const handleSetAmount = (el: number) => {
    setSelectPresent(el);
    if (!showBalance || !selectedOption || !decimals) return;

    const amount = BN.parseUnits(new BN(selectedOption[showBalance] ?? 0).multipliedBy(el).div(new BN(100)), decimals);
    onChangeValue(amount);
  };
  if (!selectedOption || !showBalance) return;
  const isInputError = new BN(BN.formatUnits(amount.toString(), decimals)).gt(selectedOption[showBalance] ?? 0);
  return (
    <SmartFlex gap="10px" column>
      <SmartFlex gap="4px" column>
        <SmartFlexInput error={isInputError}>
          <InputContainer>
            <TransparentInput
              decimals={decimals}
              placeholder="0.01"
              value={amount}
              onChange={(value: BN) => {
                setSelectPresent(0);
                onChangeValue(value);
              }}
            />
          </InputContainer>
          <TokenSelect
            assets={dataAssets}
            label={label}
            selectedOption={selectedOption}
            showBalance={showBalance}
            onSelect={onSelect}
          />
        </SmartFlexInput>
        {isInputError && (
          <Text color={theme.colors.attention} type={TEXT_TYPES.BUTTON}>
            Not enough {selectedOption.asset.symbol}
          </Text>
        )}
      </SmartFlex>
      <SmartFlex alignItems="center" justifyContent="space-between">
        <PriceText color={theme.colors.greenLight} type={TEXT_TYPES.BODY}>
          ${BN.formatUnits(new BN(selectedOption?.price ?? 0).multipliedBy(amount), decimals).toFormat(2)}
        </PriceText>
        <SmartFlex gap="5px">
          {presentData.map((el) => (
            <ButtonPresent
              key={el.text}
              el={el.value}
              selectPresent={selectPresent}
              text
              onClick={() => handleSetAmount(el.value)}
            >
              <TextPresent color={theme.colors.textSecondary}>{el.text}</TextPresent>
            </ButtonPresent>
          ))}
        </SmartFlex>
      </SmartFlex>
    </SmartFlex>
  );
};

export default SelectAssetsInput;

const PriceText = styled(Text)`
  overflow: clip;
  width: 164px;
  text-align: left;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
`;
const TextPresent = styled(Text)``;

const ButtonPresent = styled(Button)<{ el: number; selectPresent: number }>`
  padding: 5px !important;
  height: auto !important;
  width: auto !important;
  background: ${({ el, selectPresent }) => (el === selectPresent ? "#535353" : "#53535326")};
  border-radius: 4px;
  ${TextPresent} {
    color: ${({ theme, el, selectPresent }) => (el === selectPresent ? "white" : theme.colors.textSecondary)};
  }
  &:hover {
    background: ${({ theme }) => theme.colors.textDisabled};
    ${TextPresent} {
      color: ${({ theme }) => theme.colors.textPrimary};
    }
  }
`;
const SmartFlexInput = styled(SmartFlex)<{
  error?: boolean;
}>`
  padding: 8px 0px;
  border-bottom: 1px solid ${({ error, theme }) => (error ? theme.colors.attention : theme.colors.textDisabled)};
  input {
    color: ${({ error, theme }) =>
      (() => {
        if (error) return theme.colors.attention;
        return theme.colors.textPrimary;
      })()};
  }
  &:hover {
    border-bottom: 1px solid ${({ error, theme }) => (error ? theme.colors.attention : theme.colors.textPrimary)};
  }
  &:focus-within {
    border-bottom: 1px solid ${({ error, theme }) => (error ? theme.colors.attention : theme.colors.textPrimary)};
  }
`;

const TransparentInput = styled(BigNumberInput)`
  color: white;
  ${TEXT_TYPES_MAP[TEXT_TYPES.H_TEXT]};
  background: transparent;
  border: none;
  width: 80%;
  &:focus-visible {
    border: none;
    outline: none;
  }
`;
