import React, { useRef, useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import arrowIcon from "@src/assets/icons/arrowUp.svg";
import CloseIcon from "@src/assets/icons/close.svg?react";
import Text, { TEXT_TYPES } from "@src/components/Text";
import { useMedia } from "@src/hooks/useMedia";
import { useOnClickOutside } from "@src/hooks/useOnClickOutside";
import { media } from "@src/themes/breakpoints";

export type TokenOption = {
  key: string;
  title: string;
  symbol: string;
  img: string;
  balance: string;
  priceFeed: string;
  assetId: string;
  decimals: number;
};

interface TokenSelectProps {
  selectType: "Buy" | "Sell";
  value: TokenOption;
  options: TokenOption[];
  onSelect: (option: TokenOption) => void;
}

export const TokenSelect: React.FC<TokenSelectProps> = ({ value, options, onSelect, selectType }) => {
  const media = useMedia();
  const theme = useTheme();
  const [isSelectMenuVisible, setSelectMenuVisible] = useState(false);
  // const [filteredOptions, setFilteredOptions] = useState<TokenOption[]>(options);
  // const [searchTerm, setSearchTerm] = useState("");

  // useEffect(() => {
  //   setFilteredOptions(options);
  // }, [options]);

  // const filterTokens = (search: string) => {
  //   const lowercasedSearch = search.toLowerCase();
  //   const filtered = options.filter(
  //     (option) =>
  //       option.title.toLowerCase().includes(lowercasedSearch) || option.symbol.toLowerCase().includes(lowercasedSearch),
  //   );
  //   setFilteredOptions(filtered);
  // };

  // const handleSearchChange = (value: string) => {
  //   setSearchTerm(value);
  //   filterTokens(value);
  // };

  const selectRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(selectRef, () => setSelectMenuVisible(false));

  const selectOption = (option: TokenOption) => {
    setSelectMenuVisible(false);
    onSelect(option);
  };

  return (
    <SelectWrapper
      focused={isSelectMenuVisible}
      onClick={() => (!isSelectMenuVisible ? setSelectMenuVisible(true) : null)}
    >
      <SelectedOption>
        <img alt={value.symbol} src={value.img} />
        {value.symbol}
      </SelectedOption>

      <img alt="arrow" className="menu-arrow" src={arrowIcon} />
      {isSelectMenuVisible && (
        <MobileOverlay>
          <OptionsContainer ref={selectRef}>
            <Container>
              {media.mobile && (
                <MobileHeader>
                  <Text type={TEXT_TYPES.H} primary>
                    {selectType}
                  </Text>
                  <CloseIcon onClick={() => setSelectMenuVisible(false)} />
                </MobileHeader>
              )}
              {/* TODO add when there will be more tokens */}
              {/* <SearchInput value={searchTerm} onChange={handleSearchChange} /> */}
            </Container>

            <OptionsHeader>
              <Text type={TEXT_TYPES.BODY}>Asset</Text>
              <Text type={TEXT_TYPES.BODY}>Balance</Text>
            </OptionsHeader>
            {options.map((option) => (
              <Option key={option.key} onClick={() => selectOption(option)}>
                <OptionRightPart key={option.key}>
                  <img alt={option.symbol} src={option.img} />
                  <OptionTitle>
                    <TokenSymbol color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
                      {option.symbol}
                    </TokenSymbol>
                    <Text type={TEXT_TYPES.BODY}>{option.title}</Text>
                  </OptionTitle>
                </OptionRightPart>

                <Text color={theme.colors.greenLight} type={TEXT_TYPES.BODY}>
                  {option.balance ?? "0.00"}
                </Text>
              </Option>
            ))}
          </OptionsContainer>
        </MobileOverlay>
      )}
    </SelectWrapper>
  );
};

const SelectWrapper = styled.div<{
  focused?: boolean;
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
  min-width: 121px;

  .menu-arrow {
    transition: 0.4s;
    transform: ${({ focused }) => (focused ? "rotate(-180deg)" : "rotate(0deg)")};
  }

  :hover {
    background-color: #ffffff12;
    .menu-arrow {
      transform: ${({ focused }) => (focused ? "rotate(-180)" : "rotate(-90deg)")};
    }
  }

  ${media.mobile} {
    position: static;
  }
`;

const SelectedOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Container = styled.div`
  padding: 0 16px;
`;

const MobileOverlay = styled.div`
  ${media.mobile} {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background-color: #93939338;
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    z-index: 1;
  }
`;

const MobileHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 26px;
`;

const OptionsContainer = styled.div`
  z-index: 1;
  position: absolute;
  top: calc(100% + 8px);
  width: 300px;
  right: 0;
  background-color: ${({ theme }) => theme.colors.bgSecondary};
  padding: 8px 0 8px;
  border-radius: 10px;
  max-height: 336px;
  display: flex;
  flex-direction: column;
  gap: 13px;

  ${media.mobile} {
    z-index: 2;
    backdrop-filter: blur(5px);
    position: relative;
    left: auto;
    right: auto;
    width: calc(100% - 16px);
    margin: 0 auto;
    top: auto;
  }
`;

const OptionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
`;

const Option = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  padding: 4px 16px;

  &:hover {
    background-color: #373737;
  }

  &:last-child {
    border-radius: 0 0 10px 10px;
  }
`;

const OptionRightPart = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OptionTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TokenSymbol = styled(Text)`
  font-size: 16px;
`;
