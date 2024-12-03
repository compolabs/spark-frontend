import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import { SmartFlex } from "@components/SmartFlex";
import { media } from "@themes/breakpoints";

import AssetsDashboard from "@screens/Dashboard/AssetsDashboard.tsx";
import InfoDataGraph from "@screens/Dashboard/InfoDataGraph";
import BottomTables from "@screens/SpotScreen/BottomTables";
import StatusBar from "@screens/SpotScreen/StatusBar";

import { DashboardFilter } from "./DashboardFilter";
import { MarketDataSection } from "./MarketDataSection";

const Dashboard = observer(() => {
  return (
    <DashboardContainer>
      <DashboardColumn>
        <DashboardFilter />
        <UserInfoData>
          <MarketDataSection />
          <InfoDataGraph />
        </UserInfoData>
        <BottomTables />
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
`;

const DashboardColumn = styled(Column)`
  width: 100%;
  gap: 4px;
`;

const StatusBarStyled = styled(SmartFlex)`
  margin-top: 80px;
`;
