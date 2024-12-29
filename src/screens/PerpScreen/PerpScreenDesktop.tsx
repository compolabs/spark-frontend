import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Chart from "@components/Chart";
import MarketStatisticsBar from "@components/MarketHeader";
import MarketSelection from "@components/MarketSelection";
import { SmartFlex } from "@components/SmartFlex";
import StatusBar from "@components/StatusBar";
import { media } from "@themes/breakpoints";

import { useStores } from "@stores";

import OrderbookAndTrades from "@screens/PerpScreen/OrderbookAndTrades/OrderbookAndTrades.tsx";
import RightBlock from "@screens/PerpScreen/RightBlock";

import BottomTables from "./BottomTables/BottomTables";

const PerpScreenDesktop: React.FC = observer(() => {
  const { marketStore } = useStores();

  return (
    <Root>
      <MarketStatisticsBar />
      {marketStore.marketSelectionOpened && <MarketSelection />}
      <ContentContainer>
        <SmartFlex gap="4px" column>
          <Chart />
          <BottomTables />
        </SmartFlex>
        <OrderbookAndTrades />
        <RightBlock />
      </ContentContainer>
      <StatusBar />
    </Root>
  );
});

export default PerpScreenDesktop;

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
