import React, { useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import MarketStatisticsBar from "@components/MarketHeader";
import MarketSelection from "@components/MarketSelection";
import MarketStatistics from "@components/MarketStatistics";
import MenuOverlay from "@components/MenuOverlay";
import { SmartFlex } from "@components/SmartFlex";
import StatusBar from "@components/StatusBar/StatusBar";
import { media } from "@themes/breakpoints";

import { useStores } from "@stores";

const PerpScreenMobile: React.FC = observer(() => {
  const { marketStore } = useStores();
  const [isChartOpen, setIsChartOpen] = useState(false);

  const handleToggleChart = () => {
    setIsChartOpen((isOpen) => !isOpen);
  };

  const renderChartInfo = () => {
    return (
      <>
        <MarketStatistics />
        {/* <Chart /> */}
      </>
    );
  };

  const renderOrderBook = () => {
    return (
      <MobileContent>
        <ContentWrapper>{/* <SpotOrderBook /> */}</ContentWrapper>
        <ContentWrapper>{/* <CreateOrder /> */}</ContentWrapper>
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
      {/* <BottomTables /> */}
      <MenuOverlay isOpen={marketStore.marketSelectionOpened} offsetTop={50} top={40}>
        <MarketSelection />
      </MenuOverlay>
      <StatusBar />
    </Root>
  );
});

export default PerpScreenMobile;

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
`;

const ContentWrapper = styled(SmartFlex)`
  background-color: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 10px;
`;
