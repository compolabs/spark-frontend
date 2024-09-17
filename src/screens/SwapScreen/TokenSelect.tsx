import React, { useState } from "react";
import styled from "@emotion/styled";

import { Column } from "@components/Flex";
import SearchInput from "@components/SearchInput";
import AssetBlock from "@components/SelectAssets/AssetBlock";
import { AssetBlockData } from "@components/SelectAssets/SelectAssetsInput";
import SizedBox from "@components/SizedBox";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import Tooltip from "@components/Tooltip";
import { media } from "@themes/breakpoints";

import arrowIcon from "@assets/icons/arrowUp.svg";

export type TokenOption = {
  key: string;
  title: string;
  symbol: string;
  img: string;
  balance: string;
  priceFeed: string;
  assetId: string;
  decimals: number;
  precision: number;
};

interface TokenSelectProps {
  assets: AssetBlockData[];
  showBalance: "balance" | "walletBalance" | "contractBalance";
  label?: string;
  selectedOption: AssetBlockData;
  onSelect: (v: AssetBlockData, index: number) => void;
  type?: "rounded" | "square";
}

export const TokenSelect: React.FC<TokenSelectProps> = ({
  assets,
  showBalance,
  label,
  selectedOption,
  onSelect,
  type = "square",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const handleSelectClick = (v: AssetBlockData, index: number) => {
    onSelect(v, index);
    setIsVisible(false);
  };

  const handleChangeSearch = (text: string) => {
    setSearchValue(text);
  };

  const filteredItem = assets.filter((item) => item.asset.name.toLowerCase().includes(searchValue.toLowerCase()));

  return (
    <TooltipAssetsContainer>
      <Tooltip
        config={{
          placement: "bottom-end",
          trigger: "click",
          visible: isVisible,
          onVisibleChange: setIsVisible,
        }}
        containerStyles={{ padding: 0 }}
        content={
          <ColumnContent crossAxisSize="max">
            <Container>
              <SearchInput placeholder=" " value={searchValue} variant="transparent" onChange={handleChangeSearch} />
            </Container>
            <OptionsHeader>
              <Text type={TEXT_TYPES.BUTTON}>Asset</Text>
              <Text type={TEXT_TYPES.BUTTON}>Wallet Balance</Text>
            </OptionsHeader>
            {filteredItem.length > 0 ? (
              filteredItem.map((v, index) => {
                const active = selectedOption.assetId === v.assetId;
                return (
                  <>
                    <Option key={v.assetId + "_option"} active={active} onClick={() => handleSelectClick(v, index)}>
                      <AssetBlock key={v.assetId} options={{ showBalance }} token={v} />
                    </Option>
                  </>
                );
              })
            ) : (
              <NoFoundAssets>
                <TextNoFoundAssets>Asset not found</TextNoFoundAssets>
              </NoFoundAssets>
            )}
          </ColumnContent>
        }
      >
        <Wrap focused={isVisible}>
          <Text>{label}</Text>
          <SizedBox height={2} />
          <Root type={type} onBlur={() => setIsVisible(false)} onClick={() => setIsVisible(true)}>
            {selectedOption && (
              <AssetBlock
                key={selectedOption.assetId}
                options={{ isShowBalance: false, showBalance }}
                token={selectedOption}
                type="rounded"
              />
            )}
            <img alt="arrow" className="menu-arrow" src={arrowIcon} />
          </Root>
        </Wrap>
      </Tooltip>
    </TooltipAssetsContainer>
  );
};

const TooltipAssetsContainer = styled(SmartFlex)`
  width: auto;
`;

const ColumnContent = styled(Column)`
  width: 320px;
  ${media.mobile} {
    width: 100vw;
  }
`;

const OptionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 16px;
  height: 40px;
  width: 100%;
`;

const TextNoFoundAssets = styled(Text)`
  text-align: center;
  margin: auto;
`;

const NoFoundAssets = styled(SmartFlex)`
  width: 100%;
  margin: auto;
  text-align: center;
  padding-bottom: 20px;
  padding-top: 30px;
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

const Root = styled.div<{
  focused?: boolean;
  disabled?: boolean;
  type?: "rounded" | "square";
}>`
  display: flex;
  padding: 8px;
  box-sizing: border-box;
  border-radius: ${({ type }) => (type === "rounded" ? "32px" : "8px")};
  gap: 8px;
  background: ${({ theme, type }) => (type === "rounded" ? "#1F1F1F" : theme.colors.bgPrimary)};
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

const Container = styled.div`
  padding: 0 16px;
  width: 100%;
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
  padding: 5px 16px;
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

  :last-child {
    border-radius: 0px 0px 10px 10px;
  }

  ${TEXT_TYPES_MAP[TEXT_TYPES.BUTTON_SECONDARY]};
`;
