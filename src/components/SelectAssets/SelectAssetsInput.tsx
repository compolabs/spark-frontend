import React, { HTMLAttributes, useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import Button from "@components/Button";
import SearchInput from "@components/SearchInput.tsx";
import AssetBlock, { IAssetBlock } from "@components/SelectAssets/AssetBlock";
import SizedBox from "@components/SizedBox";
import { SmartFlex } from "@components/SmartFlex";
import { BigNumberInput } from "@components/TokenInput/BigNumberInput";
import arrowIcon from "@src/assets/icons/arrowUp.svg";
import { DEFAULT_DECIMALS } from "@src/constants";
import { Token } from "@src/entity";
import { media } from "@src/themes/breakpoints";
import BN from "@src/utils/BN";

import { Column } from "../Flex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "../Text";
import Tooltip from "../Tooltip";

export interface AssetBlockData {
  asset: Token;
  walletBalance: string;
  contractBalance: string;
  balance: string;
  assetId: string;
  price?: string;
}

interface IProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  selected?: T;
  onSelect: (option: AssetBlockData, index: number) => void;
  onChangeValue: (value: BN) => void;
  label?: string;
  dataAssets: AssetBlockData[];
  showBalance: IAssetBlock["options"]["showBalance"];
  amount: BN;
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

const SelectAssetsInput = <T,>({
  showBalance,
  selected,
  onSelect,
  label,
  dataAssets,
  onChangeValue,
  amount,
  ...rest
}: IProps<T>) => {
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();
  const selectedOption = dataAssets.find(({ assetId }) => selected === assetId);
  const [searchValue, setSearchValue] = useState("");
  const [selectPresent, setSelectPresent] = useState(0);
  const handleSelectClick = (v: AssetBlockData, index: number) => {
    onSelect(v, index);
    setIsVisible(false);
    onChangeValue(BN.ZERO);
  };
  const handleSetAmount = (el: number) => {
    setSelectPresent(el);
    if (!showBalance || !selectedOption) return;
    const amount = BN.parseUnits(
      new BN(selectedOption[showBalance] ?? 0).multipliedBy(el).div(new BN(100)),
      DEFAULT_DECIMALS,
    );
    onChangeValue(amount);
  };
  const handleChangeSearch = (e: string) => {
    setSearchValue(e);
  };
  if (!selectedOption || !showBalance) return;
  const isInputError = new BN(BN.formatUnits(amount.toString(), DEFAULT_DECIMALS)).gt(selectedOption[showBalance] ?? 0);
  return (
    <SmartFlex gap="10px" column>
      <SmartFlexInput>
        <InputContainer error={isInputError}>
          <TransparentInput
            placeholder="0.01"
            value={amount}
            onChange={(value: BN) => {
              onChangeValue(value);
            }}
          />
        </InputContainer>
        <TooltipAssetsContainer>
          <Tooltip
            config={{
              placement: "bottom-start",
              trigger: "click",
              visible: isVisible,
              onVisibleChange: setIsVisible,
            }}
            containerStyles={{ padding: 0 }}
            content={
              <ColumnContent crossAxisSize="max">
                <Container>
                  <SearchInput
                    placeholder=" "
                    value={searchValue}
                    variant="transparent"
                    onChange={handleChangeSearch}
                  />
                </Container>
                <OptionsHeader>
                  <Text type={TEXT_TYPES.BODY}>Asset</Text>
                  <Text type={TEXT_TYPES.BODY}>Wallet Balance</Text>
                </OptionsHeader>
                {dataAssets
                  .filter((item) => item.asset.name.toLowerCase().includes(searchValue.toLowerCase()))
                  .map((v, index) => {
                    const active = selected === v.assetId;
                    return (
                      <>
                        <Option key={v.assetId + "_option"} active={active} onClick={() => handleSelectClick(v, index)}>
                          <AssetBlock
                            key={v.assetId}
                            options={{ showBalance }}
                            styleToken={{ background: "transparent", padding: "4px 2px" }}
                            token={v}
                          />
                        </Option>
                      </>
                    );
                  })}
              </ColumnContent>
            }
          >
            <Wrap focused={isVisible}>
              <Text>{label}</Text>
              <SizedBox height={2} />
              <Root onBlur={() => setIsVisible(false)} onClick={() => setIsVisible(true)} {...rest}>
                {selectedOption && (
                  <AssetBlock
                    key={selectedOption.assetId}
                    options={{ isShowBalance: false, showBalance }}
                    token={selectedOption}
                  />
                )}
                <img alt="arrow" className="menu-arrow" src={arrowIcon} />
              </Root>
            </Wrap>
          </Tooltip>
        </TooltipAssetsContainer>
      </SmartFlexInput>
      <SmartFlex alignItems="center" justifyContent="space-between">
        <Text color={theme.colors.greenLight} style={{ textAlign: "right" }} type={TEXT_TYPES.BODY}>
          ${BN.formatUnits(new BN(selectedOption?.price ?? 0).multipliedBy(amount), DEFAULT_DECIMALS).toFormat(2)}
        </Text>
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

const InputContainer = styled.div<{
  error?: boolean;
}>`
  display: flex;
  align-items: center;
  input {
    color: ${({ error, theme }) =>
      (() => {
        if (error) return theme.colors.attention;
        return theme.colors.textSecondary;
      })()};
  }
`;

const ColumnContent = styled(Column)`
  width: 320px;
`;

const OptionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  height: 32px;
  width: 100%;
`;

const TextPresent = styled(Text)``;

const Container = styled.div`
  padding: 0 14px;
  width: 100%;
`;

const ButtonPresent = styled(Button)<{ el: number; selectPresent: number }>`
  padding: 5px !important;
  height: auto !important;
  width: auto !important;
  background: ${({ theme, el, selectPresent }) => (el === selectPresent ? "#535353" : "#53535326")};
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
const SmartFlexInput = styled(SmartFlex)`
  padding: 8px 0px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.textDisabled};
`;
const TooltipAssetsContainer = styled(SmartFlex)`
  width: auto;
`;

const TransparentInput = styled(BigNumberInput)`
  color: white;
  font-family: "Space Grotesk";
  font-size: 24px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px; /* 66.667% */
  letter-spacing: 0.48px;
  background: transparent;
  border: none;
  width: 80%;
  &:focus-visible {
    border: none;
    outline: none;
  }
`;
const Root = styled.div<{
  focused?: boolean;
  disabled?: boolean;
}>`
  display: flex;
  padding: 8px;
  box-sizing: border-box;
  border-radius: 8px;
  gap: 8px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  border: 1px solid ${({ focused, theme }) => (focused ? theme.colors.borderAccent : theme.colors.borderSecondary)};
  ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}
  color: ${({ theme, disabled }) => (!disabled ? theme.colors.textPrimary : theme.colors.textDisabled)};
  cursor: ${({ disabled }) => (!disabled ? "pointer" : "not-allowed")};
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;

  ${media.mobile} {
    height: 56px;
  }
`;

export const Option = styled.div<{
  active?: boolean;
  disabled?: boolean;
}>`
  width: 100%;
  display: flex;
  cursor: ${({ disabled }) => (!disabled ? "pointer" : "not-allowed")};
  align-items: center;
  background: ${({ active, theme }) => (active ? theme.colors.borderPrimary : "transparent")};
  color: ${({ disabled, theme }) => (disabled ? theme.colors.textDisabled : theme.colors.textPrimary)};
  padding: 8px 10px;
  box-sizing: border-box;
  white-space: nowrap;
  transition: 0.4s;
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};

  :hover {
    background: ${({ theme, active, disabled }) =>
      active ? theme.colors.borderPrimary : disabled ? "transparent" : theme.colors.borderSecondary};
  }

  :active {
    background: ${({ theme, disabled }) => (!disabled ? theme.colors.borderPrimary : "transparent")};
  }

  ${TEXT_TYPES_MAP[TEXT_TYPES.BUTTON_SECONDARY]};
`;

const Wrap = styled.div<{
  focused?: boolean;
  disabled?: boolean;
}>`
  display: flex;
  flex-direction: column;
  width: 100%;
  .menu-arrow {
    transition: 0.4s;
    transform: ${({ focused }) => (focused ? "rotate(-180deg)" : "rotate(0deg)")};
  }

  :hover {
    .menu-arrow {
      transform: ${({ focused, disabled }) =>
        focused ? "rotate(-180)" : disabled ? "rotate(0deg)" : "rotate(-90deg)"};
    }
  }
`;
