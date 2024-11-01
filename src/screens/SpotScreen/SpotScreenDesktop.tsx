import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { SmartFlex } from "@components/SmartFlex";
import { media } from "@themes/breakpoints";

import { useStores } from "@stores";

import BottomTables from "@screens/SpotScreen/BottomTables";
import Chart from "@screens/SpotScreen/Chart";
import MarketStatisticsBar from "@screens/SpotScreen/MarketStatisticsBar";
import StatusBar from "@screens/SpotScreen/StatusBar/StatusBar";

import OrderbookAndTradesInterface from "./OrderbookAndTradesInterface/OrderbookAndTradesInterface";
import MarketSelection from "./RightBlock/MarketSelection";
import RightBlock from "./RightBlock/RightBlock";

const SpotScreenDesktop: React.FC = observer(() => {
  const { tradeStore } = useStores();

  return (
    <Root>
      <MarketStatisticsBar />
      {tradeStore.marketSelectionOpened && <MarketSelection />}
      <ContentContainer>
        <SmartFlex gap="4px" column>
          <Chart />
          <BottomTables />
        </SmartFlex>
        <OrderbookAndTradesInterface />
        <RightBlock />
      </ContentContainer>
      <StatusBar />
    </Root>
  );
});

export default SpotScreenDesktop;

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

const ContentContainer = styled.div`
  display: grid;
  position: relative;
  grid-template-columns: minmax(300px, 1fr) minmax(min-content, 273px) minmax(100px, 273px);
  grid-template-rows: minmax(600px, calc(100vh - 140px));
  width: 100%;
  height: 100%;
  gap: 4px;
`;
