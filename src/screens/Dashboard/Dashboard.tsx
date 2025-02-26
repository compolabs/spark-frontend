import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import { DashboardPoints } from "@components/Points/DashboardPoints";
import { SmartFlex } from "@components/SmartFlex";
import { media } from "@themes/breakpoints";

import AssetsDashboard from "@screens/Dashboard/AssetsDashboard";
import InfoDataGraph from "@screens/Dashboard/InfoDataGraph";
import BottomTables from "@screens/SpotScreen/BottomTables";
import StatusBar from "@screens/SpotScreen/StatusBar";

import { DashboardFilter } from "./DashboardFilter";
import { MarketDataSection } from "./MarketDataSection";

const Dashboard = observer(() => {
  return (
    <DashboardContainer>
      <DashboardColumn>
        <DashboardPoints />
        <DashboardFilter />
        <UserInfoData>
          <MarketDataSection />
          <InfoDataGraph />
        </UserInfoData>
        <BottomTables isShowBalance={false} />
      </DashboardColumn>
      <AssetsDashboard />
      <StatusBarStyled />
      <StatusBar />
    </DashboardContainer>
  );
});

export default Dashboard;

const UserInfoData = styled(SmartFlex)`
  width: 100%;
  height: 100%;
  gap: 4px;
  ${media.mobile} {
    flex-direction: column;
  }
`;

const DashboardContainer = styled(Column)`
  width: 90%;
  margin: 0px auto;
  justify-content: space-between;

  ${media.mobile} {
    width: 100%;
    padding: 0 8px;
  }
`;

const DashboardColumn = styled(Column)`
  width: 100%;
  gap: 4px;
`;

const StatusBarStyled = styled(SmartFlex)`
  margin-top: 80px;
`;
