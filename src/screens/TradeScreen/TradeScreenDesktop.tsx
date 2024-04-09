import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import BottomTables from "@screens/TradeScreen/BottomTables";
import Chart from "@screens/TradeScreen/Chart";
import MarketStatisticsBar from "@screens/TradeScreen/MarketStatisticsBar";
import StatusBar from "@screens/TradeScreen/StatusBar/StatusBar";
import { Column } from "@src/components/Flex";
import { useStores } from "@src/stores";
import { media } from "@src/themes/breakpoints";

import OrderbookAndTradesInterface from "./OrderbookAndTradesInterface/OrderbookAndTradesInterface";
import MarketSelection from "./RightBlock/MarketSelection";
import RightBlock from "./RightBlock/RightBlock";

const TradeScreenDesktop: React.FC = observer(() => {
  const { tradeStore } = useStores();

  return (
    <Root>
      <MarketStatisticsBar />
      <ContentContainer>
        {tradeStore.marketSelectionOpened && <MarketSelection />}
        <Column crossAxisSize="max" mainAxisSize="stretch" style={{ flex: 5 }}>
          <Chart />
          <BottomTables />
        </Column>
        <OrderbookAndTradesInterface />
        <RightBlock />
      </ContentContainer>
      <StatusBar />
    </Root>
  );
});

export default TradeScreenDesktop;

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
  width: 100%;
  height: 100%;
  gap: 4px;
`;
