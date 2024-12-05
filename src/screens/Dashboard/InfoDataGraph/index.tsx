import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import Button from "@components/Button";
import { ConnectWalletButton } from "@components/ConnectWalletButton";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import { useStores } from "@stores";

import TradingViewScoreboardWidget from "@screens/Dashboard/TradingViewScoreboardWidget";

interface TradeEvent {
  time: number;
  value: number;
}

const generateTradingData = (data: TradeEvent[]) => {
  if (data.length < 1) return [];
  const firstDate = data[0].time * 1000;

  const currentDate = Date.now();

  const oneHour = 60 * 60 * 1000;
  let currentTimestamp = firstDate;
  const additionalData = [];

  while (currentTimestamp <= currentDate) {
    if (!data.some((item) => item.time === Math.floor(currentTimestamp / 1000))) {
      additionalData.push({
        time: Math.floor(currentTimestamp / 1000),
        value: 0,
      });
    }
    currentTimestamp += oneHour;
  }

  return [...data, ...additionalData].sort((a, b) => a.time - b.time);
};

const NoDataTrading = observer(() => {
  const navigate = useNavigate();
  return (
    <NoDataTradingContainer>
      <TextContainer>
        <Text type={TEXT_TYPES.H} primary>
          No data to show
        </Text>
        <Text type={TEXT_TYPES.BODY} secondary>
          Begin trading to view updates on your portfolio
        </Text>
        <ConnectWalletButton targetKey="header_connect_btn" fitContent>
          <TradeNowButton onClick={() => navigate("/spot")}>TRADE NOW</TradeNowButton>
        </ConnectWalletButton>
      </TextContainer>
    </NoDataTradingContainer>
  );
});

const InfoDataGraph: React.FC = observer(() => {
  const { dashboardStore } = useStores();
  const data = dashboardStore.activeUserStat
    ? generateTradingData(dashboardStore.getChartDataTrading())
    : dashboardStore.getChartDataPortfolio();
  return data.length > 0 ? <TradingViewScoreboardWidget data={data} /> : <NoDataTrading />;
});

export default InfoDataGraph;

const NoDataTradingContainer = styled(SmartFlex)`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(46, 46, 46, 1);
  width: 100%;
  ${media.mobile} {
    min-height: 359px;
  }
`;

const TextContainer = styled(SmartFlex)`
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
`;

const TradeNowButton = styled(Button)`
  margin-top: 8px;
  max-width: 200px;
`;
