import React, { useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button.tsx";
import { SmartFlex } from "@components/SmartFlex.tsx";
import { media } from "@themes/breakpoints";

import { useStores } from "@stores";

import TradingViewChartAdvance from "@screens/SpotScreen/Chart/TradingViewAdvanceWidget.tsx";
import TradingViewWidget from "@screens/SpotScreen/Chart/TradingViewWidget.tsx";

const Chart: React.FC = observer(() => {
  const [activeChart, setActiveChart] = useState(1);
  const handleSelect = (active: number) => {
    setActiveChart(active);
  };

  const { tradeStore } = useStores();
  const market = tradeStore.market?.symbol.replace("-", "");
  return (
    <Root>
      <HeaderTradingView>
        <Button disabled={activeChart === 1} fitContent onClick={() => handleSelect(1)}>
          SIMPLE CHART
        </Button>
        <Button disabled={activeChart === 0} fitContent onClick={() => handleSelect(0)}>
          ADVANCED CHART
        </Button>
      </HeaderTradingView>
      {activeChart === 0 ? (
        market === "USDCUSDT" ? (
          <CenterContainer>Not data</CenterContainer>
        ) : (
          <TradingViewChartAdvance />
        )
      ) : (
        <TradingViewWidget />
      )}
    </Root>
  );
});

export default Chart;

const Root = styled.div`
  background: #141414;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderSecondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 3;

  ${media.mobile} {
    min-height: 412px;
    max-height: 412px;
  }

  & > * {
    width: 100%;
    height: 100%;
  }
`;

const CenterContainer = styled(SmartFlex)`
  justify-content: center;
  align-items: center;
`;
const HeaderTradingView = styled(SmartFlex)`
  height: auto;
  gap: 5px;
  padding: 8px;
`;
