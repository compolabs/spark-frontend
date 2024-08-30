import React, { useRef, useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Divider from "@components/Divider";
import { Row } from "@components/Flex";
import SearchInput from "@components/SearchInput";
import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import { SmartFlex } from "@src/components/SmartFlex";
import { PerpMarket, SpotMarket } from "@src/entity";
import { useMedia } from "@src/hooks/useMedia";
import { useOnClickOutside } from "@src/hooks/useOnClickOutside";
import SpotMarketRow from "@src/screens/TradeScreen/RightBlock/MarketSelection/SpotMarketRow";
import { media } from "@src/themes/breakpoints";
import { useStores } from "@stores";

import { MarketTitle } from "./MarketTitle";

interface IProps {}

const useFilteredMarkets = <T extends SpotMarket | PerpMarket>(markets: T[], searchValue: string) => {
  return markets.filter((market) => market.symbol.includes(searchValue));
};

const MarketSelection: React.FC<IProps> = observer(() => {
  const { tradeStore } = useStores();
  const media = useMedia();
  const [searchValue, setSearchValue] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(rootRef, () => {
    if (media.desktop) {
      tradeStore.setMarketSelectionOpened(false);
    }
  });

  const spotMarketsFiltered = useFilteredMarkets(tradeStore.spotMarkets, searchValue);

  const renderSpotMarketList = () => {
    if (!spotMarketsFiltered.length) {
      return (
        <>
          <SizedBox height={16} />
          <Row justifyContent="center">
            <Text>No spot markets found</Text>
          </Row>
        </>
      );
    }

    return spotMarketsFiltered.map((market) => <SpotMarketRow key={market.symbol} market={market} />);
  };

  return (
    <Container ref={rootRef}>
      {media.desktop ? <CloseIcon onClick={() => tradeStore.setMarketSelectionOpened(false)} /> : null}
      {tradeStore.market && media.desktop ? (
        <TitleContainer>
          <MarketTitle iconSize={24} market={tradeStore.market} />
        </TitleContainer>
      ) : null}
      <Root>
        <SearchContainer>
          <SearchInput value={searchValue} onChange={setSearchValue} />
        </SearchContainer>

        <SmartFlex justifyContent="space-between" margin="24px 0 12px 0" padding="0 12px">
          <Text type={TEXT_TYPES.BODY}>MARKET</Text>
          <Text type={TEXT_TYPES.BODY}>PRICE</Text>
        </SmartFlex>
        <Divider />
        {renderSpotMarketList()}
      </Root>
    </Container>
  );
});

export default MarketSelection;

const Container = styled.div`
  position: absolute;
  z-index: 2;
  border-radius: 10px;
  bottom: 26px;
  top: 0;
  ${media.mobile} {
    right: 0;
    left: 0;
  }
`;

const TitleContainer = styled.div`
  margin-bottom: 4px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 12px;
`;

const CloseIcon = styled.div`
  position: absolute;
  right: 15px;
  top: 15px;
  width: 14px;
  height: 14px;
  cursor: pointer;

  &:hover::before,
  &:hover::after {
    background-color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:before,
  &:after {
    position: absolute;
    left: 15px;
    content: " ";
    height: 14px;
    width: 1px;
    background-color: ${({ theme }) => theme.colors.textSecondary};
    transition: all 0.2s;
  }

  &:before {
    transform: rotate(45deg);
  }
  &:after {
    transform: rotate(-45deg);
  }
`;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 280px;
  height: calc(100% - 57px);
  z-index: 2;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 10px;
  box-shadow: 0px 4px 20px 0px #00000080;

  ${media.mobile} {
    position: relative;
    margin-top: 8px;
    width: 100%;
    height: 100%;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
`;
