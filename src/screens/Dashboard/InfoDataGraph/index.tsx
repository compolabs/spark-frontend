import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import Button from "@components/Button.tsx";
import { ConnectWalletButton } from "@components/ConnectWalletButton.tsx";
import { SmartFlex } from "@components/SmartFlex.tsx";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints.ts";

import { useStores } from "@stores";

import TradingViewScoreboardWidget from "@screens/Dashboard/TradingViewScoreboardWidget";

const NoDataTrading = observer(() => {
  const navigate = useNavigate();
  const { accountStore } = useStores();
  const wallet = accountStore.address;
  return (
    <NoDataTradingContainer>
      <TextContainer>
        <Text type={TEXT_TYPES.H} primary>
          No data to show
        </Text>
        <Text type={TEXT_TYPES.BODY} secondary>
          Begin trading to view updates on your portfolio
        </Text>
        {wallet ? (
          <TradeNowButton onClick={() => navigate("/spot")}>TRADE NOW</TradeNowButton>
        ) : (
          <ConnectWalletButton targetKey="header_connect_btn" fitContent>
            {" "}
          </ConnectWalletButton>
        )}
      </TextContainer>
    </NoDataTradingContainer>
  );
});

const InfoDataGraph: React.FC = observer(() => {
  const { dashboardStore } = useStores();
  const data = dashboardStore.getChartData(dashboardStore.activeUserStat);
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
`;

const TradeNowButton = styled(Button)`
  margin-top: 8px;
  max-width: 200px;
`;
