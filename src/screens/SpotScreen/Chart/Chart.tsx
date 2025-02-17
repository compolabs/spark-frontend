import React, { useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Row } from "@components/Flex";
import { SmartFlex } from "@components/SmartFlex";
import Tab from "@components/Tab";
import { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import { useStores } from "@stores";

import TradingViewChartAdvanced from "@screens/SpotScreen/Chart/TradingViewAdvancedWidget";
import TradingViewWidget from "@screens/SpotScreen/Chart/TradingViewWidget";

const DISABLED_SIMPLE_CHARTS = new Set(["PSYCHO-USDC", "USDF-USDC", "USDT-ETH", "FUEL-ETH"]);

const TABS = [
  {
    isSimple: true,
    title: "SIMPLE CHART",
  },
  {
    isSimple: false,
    title: "ADVANCED CHART",
  },
];

const Chart: React.FC = observer(() => {
  const { tradeStore } = useStores();

  const [activeChart, setActiveChart] = useState(0);

  const isSymbolDisabled = useMemo(
    () => DISABLED_SIMPLE_CHARTS.has(tradeStore.market?.symbol ?? ""),
    [tradeStore.market],
  );

  useEffect(() => {
    setActiveChart(isSymbolDisabled ? 1 : 0);
  }, [isSymbolDisabled]);

  const handleTabClick = (index: number) => {
    if (isSymbolDisabled) return;

    setActiveChart(index);
  };

  return (
    <Root>
      <HeaderTradingView>
        <TabContainer>
          {TABS.map(({ title, isSimple }, index) => {
            return (
              <Tab
                key={title + index}
                active={activeChart === index}
                disabled={isSymbolDisabled && isSimple}
                type={TEXT_TYPES.BUTTON_SECONDARY}
                onClick={() => handleTabClick(index)}
              >
                {title}
              </Tab>
            );
          })}
        </TabContainer>
      </HeaderTradingView>
      {activeChart === 1 ? <TradingViewChartAdvanced /> : <TradingViewWidget />}
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

const HeaderTradingView = styled(SmartFlex)`
  height: auto;
  gap: 5px;
  padding: 8px 8px 0px 8px;
`;

const TabContainer = styled(Row)`
  align-items: center;
  padding-left: 4px;
  position: relative;

  ${Tab} {
    margin: 0 16px;
  }
`;
