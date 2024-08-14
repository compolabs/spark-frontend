import React, { HTMLAttributes, useState } from "react";
import styled from "@emotion/styled";

import AssetBlock, { IAssetBlock } from "@components/SelectAssets/AssetBlock.tsx";
import SizedBox from "@components/SizedBox";
import arrowIcon from "@src/assets/icons/arrowUp.svg";
import { Token } from "@src/entity";
import { media } from "@src/themes/breakpoints";

import { Column } from "../Flex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "../Text";
import Tooltip from "../Tooltip";

export interface AssetBlockData {
  asset: Token;
  walletBalance: string;
  contractBalance: string;
  balance: string;
  assetId: string;
}

interface IProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  selected?: T;
  onSelect: (option: AssetBlockData, index: number) => void;
  label?: string;
  dataAssets: AssetBlockData[];
  showBalance: IAssetBlock["options"]["showBalance"];
}

const SelectAssets = <T,>({ showBalance, selected, onSelect, label, dataAssets, ...rest }: IProps<T>) => {
  const [isVisible, setIsVisible] = useState(false);
  const selectedOption = dataAssets.find(({ assetId }) => selected === assetId);
  const handleSelectClick = (v: AssetBlockData, index: number) => {
    onSelect(v, index);
    setIsVisible(false);
  };

  return (
    <Tooltip
      config={{
        placement: "bottom-start",
        trigger: "click",
        visible: isVisible,
        onVisibleChange: setIsVisible,
      }}
      content={
        <Column crossAxisSize="max">
          {dataAssets.map((v, index) => {
            const active = selected === v.assetId;
            return (
              <Option key={v.assetId + "_option"} active={active} onClick={() => handleSelectClick(v, index)}>
                <AssetBlock
                  key={v.assetId}
                  options={{ showBalance }}
                  styleToken={{ background: "transparent", padding: "10px 5px" }}
                  token={v}
                />
              </Option>
            );
          })}
        </Column>
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
              styleToken={{ background: "transparent", padding: "10px 5px" }}
              token={selectedOption}
            />
          )}
          <img alt="arrow" className="menu-arrow" src={arrowIcon} />
        </Root>
      </Wrap>
    </Tooltip>
  );
};

export default SelectAssets;

const Root = styled.div<{
  focused?: boolean;
  disabled?: boolean;
}>`
  display: flex;
  height: 56px;
  padding: 0 8px;
  box-sizing: border-box;
  border-radius: 4px;
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
