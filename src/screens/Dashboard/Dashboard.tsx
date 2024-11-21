import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex.tsx";
import { SmartFlex } from "@components/SmartFlex.tsx";
import { media } from "@themes/breakpoints";

import InfoDataGraph from "@screens/Dashboard/InfoDataGraph";
import BottomTables from "@screens/SpotScreen/BottomTables";

import { DashboardFilter } from "./DashboardFilter";
import { MarketDataSection } from "./MarketDataSection";

const Dashboard = observer(() => {
  return (
    <DashboardContainer>
      <DashboardFilter />
      <UserInfoData gap="4px" style={{ width: "100%" }}>
        <MarketDataSection />
        <InfoDataGraph />
      </UserInfoData>
      <BottomTables />
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
  gap: 4px;
  width: 90%;
  margin: 0px auto;
`;
