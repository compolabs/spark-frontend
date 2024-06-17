import React, { useRef, useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import arrowIcon from "@src/assets/icons/arrowUp.svg";
import SearchInput from "@src/components/SearchInput";
import Text, { TEXT_TYPES } from "@src/components/Text";
import { useMedia } from "@src/hooks/useMedia";
import { useOnClickOutside } from "@src/hooks/useOnClickOutside";
import { media } from "@src/themes/breakpoints";

export type TokenOption = {
  key: string;
  title: string;
  symbol: string;
  img: string;
};

interface TokenSelectProps {
  value: TokenOption;
  options: TokenOption[];
  onSelect: (option: TokenOption) => void;
}

export const TokenSelect: React.FC<TokenSelectProps> = ({ value, options, onSelect }) => {
  const media = useMedia();
  const theme = useTheme();
  const [isSelectMenuVisible, setSelectMenuVisible] = useState(false);

  const selectRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(selectRef, () => setSelectMenuVisible(false));

  return (
    <SelectWrapper
      ref={selectRef}
      focused={isSelectMenuVisible}
      onClick={() => setSelectMenuVisible(!isSelectMenuVisible)}
    >
      <SelectedOption>
        <img alt={value.symbol} src={value.img} />
        {value.symbol}
      </SelectedOption>

      <img alt="arrow" className="menu-arrow" src={arrowIcon} />
      {isSelectMenuVisible && (
        <OptionsContainer>
          <SearchInput value="test" onChange={() => console.log("search")} />
          <OptionsHeader>
            <Text type={TEXT_TYPES.BODY}>Asset</Text>
            <Text type={TEXT_TYPES.BODY}>Balance</Text>
          </OptionsHeader>
          {options.map((option) => (
            <Option key={option.key}>
              <OptionRightPart key={option.key} onClick={() => onSelect(option)}>
                <img alt={option.symbol} src={option.img} />
                <OptionTitle>
                  {option.symbol}
                  <Text type={TEXT_TYPES.BODY}>{option.title}</Text>
                </OptionTitle>
              </OptionRightPart>

              <Text color={theme.colors.greenLight} type={TEXT_TYPES.BODY}>
                0.00
              </Text>
            </Option>
          ))}
        </OptionsContainer>
      )}
    </SelectWrapper>
  );
};

const SelectWrapper = styled.div<{
  focused?: boolean;
  disabled?: boolean;
}>`
  position: relative;
  color: white;
  border-radius: 30px;
  background-color: ${({ focused }) => (focused ? "#ffffff12" : "#0000004D")};
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  transition: 0.4s;
  width: 121px;

  .menu-arrow {
    transition: 0.4s;
    transform: ${({ focused }) => (focused ? "rotate(-180deg)" : "rotate(0deg)")};
  }

  :hover {
    background-color: #ffffff12;
    .menu-arrow {
      transform: ${({ focused, disabled }) =>
        focused ? "rotate(-180)" : disabled ? "rotate(0deg)" : "rotate(-90deg)"};
    }
  }
`;

const SelectedOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OptionsContainer = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  width: 300px;
  right: 0;
  background-color: ${({ theme }) => theme.colors.bgSecondary};
  padding: 16px;
  border-radius: 10px;
  max-height: 336px;
  display: flex;
  flex-direction: column;
  gap: 13px;

  ${media.mobile} {
  }
`;

const OptionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Option = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
`;

const OptionRightPart = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const OptionTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
