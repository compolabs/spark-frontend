import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import { SmartFlex } from "@components/SmartFlex";
import { media } from "@themes/breakpoints";

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
        <UserInfoData gap="4px" style={{ width: "100%" }}>
          <MarketDataSection />
          <InfoDataGraph />
        </UserInfoData>
        <BottomTables />
      </DashboardColumn>
      <StatusBar />
    </DashboardContainer>
  );
});

export default Dashboard;

const UserInfoData = styled(SmartFlex)`
  ${media.mobile} {
    flex-direction: column;
  }
`;

const DashboardContainer = styled(Column)`
  width: 90%;
  margin: 0px auto;
  height: 100%;
  justify-content: space-between;
`;

const DashboardColumn = styled(Column)`
  width: 100%;
  gap: 4px;
`;
