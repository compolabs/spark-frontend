import React, { useRef, useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Divider from "@components/Divider";
import { Row } from "@components/Flex";
import SpotMarketRow from "@components/MarketSelection/SpotMarketRow";
import { MARKET_SELECTOR_ID } from "@components/MarketStatisticsBar";
import SearchInput from "@components/SearchInput";
import SizedBox from "@components/SizedBox";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import { useMedia } from "@hooks/useMedia";
import { useOnClickOutside } from "@hooks/useOnClickOutside";
import { useStores } from "@stores";

const MarketSelection: React.FC = observer(() => {
  const { marketStore } = useStores();
  const media = useMedia();
  const [searchValue, setSearchValue] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(rootRef, (event) => {
    // TODO: Used to prevent a click on the selector from reopening the sidebar
    const marketSelectorEl = document.querySelector(`#${MARKET_SELECTOR_ID}`);
    if (marketSelectorEl?.contains(event.target as any)) return;

    if (media.desktop) {
      marketStore.setMarketSelectionOpened(false);
    }
  });

  const marketsFiltered = marketStore.markets.filter((market) => market.symbol.includes(searchValue)); // TODO: add memo

  const renderSpotMarketList = () => {
    if (!marketsFiltered.length) {
      return (
        <>
          <SizedBox height={16} />
          <Row justifyContent="center">
            <Text>No spot markets found</Text>
          </Row>
        </>
      );
    }

    return marketsFiltered.map((market) => <SpotMarketRow key={market.symbol} market={market as any} />); // TODO: fix types
  };

  return (
    <Container ref={rootRef}>
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
  z-index: 10;
  border-radius: 10px;
  bottom: 26px;
  top: 52px;
  ${media.mobile} {
    right: 0;
    left: 0;
    top: 0;
  }
`;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 280px;
  height: 100%;
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
