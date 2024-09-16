import React, { useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import MenuOverlay from "@src/components/MenuOverlay";
import { SmartFlex } from "@src/components/SmartFlex";
import BottomTables from "@src/screens/SpotScreen/BottomTables";
import Chart from "@src/screens/SpotScreen/Chart";
import MarketStatisticsBar from "@src/screens/SpotScreen/MarketStatisticsBar";
import StatusBar from "@src/screens/SpotScreen/StatusBar/StatusBar";
import { media } from "@src/themes/breakpoints";
import { useStores } from "@stores";

import { SpotOrderBook } from "./OrderbookAndTradesInterface/SpotOrderBook/SpotOrderBook";
import CreateOrder from "./RightBlock/CreateOrder";
import MarketSelection from "./RightBlock/MarketSelection";
import MarketStatistics from "./MarketStatistics";

const SpotScreenMobile: React.FC = observer(() => {
  const { tradeStore } = useStores();
  const [isChartOpen, setIsChartOpen] = useState(false);

  const handleToggleChart = () => {
    setIsChartOpen((isOpen) => !isOpen);
  };

  const renderChartInfo = () => {
    return (
      <>
        <MarketStatistics />
        <Chart />
      </>
    );
  };

  const renderOrderBook = () => {
    return (
      <MobileContent>
        <ContentWrapper>
          <SpotOrderBook />
        </ContentWrapper>
        <ContentWrapper>
          <CreateOrder />
        </ContentWrapper>
      </MobileContent>
    );
  };

  const renderContent = () => {
    if (isChartOpen) return renderChartInfo();

    return renderOrderBook();
  };

  return (
    <Root>
      <MarketStatisticsBar isChartOpen={isChartOpen} onSwitchClick={handleToggleChart} />
      {renderContent()}
      <BottomTables />
      <MenuOverlay isOpen={tradeStore.marketSelectionOpened} offsetTop={50} top={40}>
        <MarketSelection />
      </MenuOverlay>
      <StatusBar />
    </Root>
  );
});

export default SpotScreenMobile;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  flex: 1;
  padding: 0 12px;
  gap: 4px;

  position: relative;

  ${media.mobile} {
    padding: 0 4px;
    gap: 8px;
  }
`;

const MobileContent = styled.div`
  display: grid;
  grid-template-areas: "orderbook .";
  grid-template-columns: 140px 1fr;
  gap: 8px;
  width: 100%;
  height: fit-content;
`;

const ContentWrapper = styled(SmartFlex)`
  background-color: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 10px;
  height: fit-content;

  &:first-of-type {
    height: 100%;
  }
`;
