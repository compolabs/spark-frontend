import React, { useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button, { ButtonGroup } from "@components/Button";
import Divider from "@components/Divider";
import { Row } from "@components/Flex";
import SearchInput from "@components/SearchInput";
import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import { SmartFlex } from "@src/components/SmartFlex";
import { useMedia } from "@src/hooks/useMedia";
import { useOnClickOutside } from "@src/hooks/useOnClickOutside";
import SpotMarketRow from "@src/screens/TradeScreen/RightBlock/MarketSelection/SpotMarketRow";
import { media } from "@src/themes/breakpoints";
import { useStores } from "@stores";

import { MarketTitle } from "./MarketTitle";
import PerpMarketRow from "./PerpMarketRow";

interface IProps {}

const MarketSelection: React.FC<IProps> = observer(() => {
  const { tradeStore } = useStores();
  const media = useMedia();
  const [searchValue, setSearchValue] = useState("");
  const [isSpotMarket, setSpotMarket] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(rootRef, () => {
    if (media.desktop) {
      tradeStore.setMarketSelectionOpened(false);
    }
  });

  const spotMarketsFiltered = useMemo(
    () =>
      tradeStore.spotMarkets.filter((market) => {
        return searchValue.length ? market.symbol.includes(searchValue) : true;
      }),
    [tradeStore.spotMarkets, searchValue],
  );

  const perpMarketsFiltered = useMemo(
    () =>
      tradeStore.perpMarkets.filter((market) => {
        return searchValue.length ? market.symbol.includes(searchValue) : true;
      }),
    [tradeStore.perpMarkets, searchValue],
  );

  const renderSpotMarketList = () => {
    if (!isSpotMarket) return;

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

  const renderPerpMarketList = () => {
    if (isSpotMarket) return;

    if (!perpMarketsFiltered.length) {
      return (
        <>
          <SizedBox height={16} />
          <Row justifyContent="center">
            <Text>No spot markets found</Text>
          </Row>
        </>
      );
    }

    return perpMarketsFiltered.map((market) => <PerpMarketRow key={market.symbol} market={market} />);
  };

  return (
    <Container ref={rootRef}>
      {media.desktop ? <CloseIcon onClick={() => tradeStore.setMarketSelectionOpened(false)} /> : null}
      <Root>
        {tradeStore.market && media.desktop ? (
          <TitleContainer>
            <MarketTitle iconSize={24} market={tradeStore.market} />
          </TitleContainer>
        ) : null}
        <SearchContainer>
          {tradeStore.isPerpAvailable && (
            <>
              <ButtonGroup>
                <Button active={isSpotMarket} onClick={() => setSpotMarket(true)}>
                  SPOT
                </Button>
                <Button active={!isSpotMarket} onClick={() => setSpotMarket(false)}>
                  PERP
                </Button>
              </ButtonGroup>
              <SizedBox height={16} />
            </>
          )}
          <SearchInput value={searchValue} onChange={setSearchValue} />
        </SearchContainer>
        <SizedBox height={24} />
        <SmartFlex justifyContent="space-between" padding="0 12px">
          <Text type={TEXT_TYPES.BODY}>MARKET</Text>
          <Text type={TEXT_TYPES.BODY}>PRICE</Text>
        </SmartFlex>
        <SizedBox height={12} />
        <Divider />
        {renderSpotMarketList()}
        {renderPerpMarketList()}
      </Root>
    </Container>
  );
});

export default MarketSelection;

const Container = styled.div`
  position: absolute;
  z-index: 2;
  background: ${({ theme }) => theme.colors.bgSecondary};
  height: 100%;
  ${media.mobile} {
    right: 0;
    left: 0;
  }
`;

const TitleContainer = styled.div`
  padding: 12px;
`;

const CloseIcon = styled.div`
  position: absolute;
  right: 15px;
  top: 12px;
  width: 18px;
  height: 18px;
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
    height: 18px;
    width: 2px;
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
  height: 100%;
  z-index: 2;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 10px;
  box-shadow: 0px 4px 20px 0px #00000080;

  ${media.mobile} {
    position: relative;
    margin-top: 8px;
    width: 100%;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
`;
