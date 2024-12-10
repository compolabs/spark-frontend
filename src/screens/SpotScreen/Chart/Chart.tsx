import React, { useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Row } from "@components/Flex";
import { SmartFlex } from "@components/SmartFlex";
import Tab from "@components/Tab";
import { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import { useStores } from "@stores";

import TradingViewChartAdvance from "@screens/SpotScreen/Chart/TradingViewAdvanceWidget";
import TradingViewWidget from "@screens/SpotScreen/Chart/TradingViewWidget";

const TABS = [
  { title: "SIMPLE CHART", disabled: false },
  { title: "ADVANCED CHART", disabled: false },
];

const Chart: React.FC = observer(() => {
  const { marketStore } = useStores();

  const [activeChart, setActiveChart] = useState(1);

  const handleSelect = (active: number) => {
    setActiveChart(active);
  };

  const market = marketStore.market?.symbol.replace("-", "");

  return (
    <Root>
      <HeaderTradingView>
        <TabContainer>
          {TABS.map(({ title, disabled }, index) => (
            <Tab
              key={title + index}
              active={activeChart === index}
              disabled={disabled}
              type={TEXT_TYPES.BUTTON_SECONDARY}
              onClick={() => !disabled && handleSelect(index)}
            >
              {title}
            </Tab>
          ))}
        </TabContainer>
      </HeaderTradingView>
      {activeChart === 1 ? (
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
