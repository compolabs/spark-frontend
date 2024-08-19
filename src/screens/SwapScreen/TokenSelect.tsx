import React, { useRef, useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import SearchInput from "@components/SearchInput";
import { SmartFlex } from "@components/SmartFlex";
import arrowIcon from "@src/assets/icons/arrowUp.svg";
import CloseIcon from "@src/assets/icons/close.svg?react";
import Text, { TEXT_TYPES } from "@src/components/Text";
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
  precision: number;
};

interface TokenSelectProps {
  selectType: "Buy" | "Sell";
  value: TokenOption;
  options: TokenOption[];
  onSelect: (option: TokenOption) => void;
}

export const TokenSelect: React.FC<TokenSelectProps> = ({ value, options, onSelect, selectType }) => {
  const theme = useTheme();
  const [isSelectMenuVisible, setSelectMenuVisible] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const [filterData, setFilterData] = useState<TokenOption[]>(options);
  useOnClickOutside(selectRef, () => setSelectMenuVisible(false));

  const selectOption = (option: TokenOption) => {
    setSelectMenuVisible(false);
    onSelect(option);
  };

  const handleChangeSearch = (text: string) => {
    setSearchValue(text);
    const filteredArray = options.filter((item) => item.symbol.toLowerCase().includes(text.toLowerCase()));
    setFilterData(filteredArray);
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
              <Header>
                <Text type={TEXT_TYPES.TITLE} primary>
                  {selectType}
                </Text>
                <CloseIconStyled onClick={() => setSelectMenuVisible(false)} />
              </Header>
              <SearchInput placeholder=" " value={searchValue} onChange={handleChangeSearch} />
            </Container>
            {filterData.length > 0 ? (
              <>
                <OptionsHeader>
                  <Text type={TEXT_TYPES.BODY}>Asset</Text>
                  <Text type={TEXT_TYPES.BODY}>Balance</Text>
                </OptionsHeader>
                {filterData.map((option) => (
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
              </>
            ) : (
              <NotFoundContainer justifyContent="center">
                <Text>Nothing found</Text>
              </NotFoundContainer>
            )}
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
    background-color: ${({ theme }) => theme.colors.overlayBackground};
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    z-index: 1;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const OptionsContainer = styled.div`
  z-index: 1;
  position: absolute;
  top: calc(100% + 8px);
  width: 300px;
  right: 0;
  background-color: ${({ theme }) => theme.colors.bgSecondary};
  padding: 16px 0 0;
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

const CloseIconStyled = styled(CloseIcon)`
  background: ${({ theme }) => theme.colors.bgIcon};
  width: 30px;
  height: 30px;
  padding: 8px;
  border-radius: 100px;
`;

const NotFoundContainer = styled(SmartFlex)`
  padding-bottom: 10px;
`;
