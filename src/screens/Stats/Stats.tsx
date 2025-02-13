import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";

import StatusBar from "@screens/SpotScreen/StatusBar";
import StatsAllTime from "@screens/Stats/StatsAllTime";
import { StatsTable } from "@screens/Stats/StatsTable/StatsTable";

const Stats = observer(() => {
  return (
    <StatsContainer>
      <StatsAllTime />
      <StatsTable />
      <StatusBar />
    </StatsContainer>
  );
});

export default Stats;

const StatsContainer = styled(Column)`
  width: 90%;
  gap: 10px;
  height: 100%;
  margin: 0 auto;
`;
