import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import StatusBar from "@components/StatusBar";

import { LeaderboardFilter } from "@screens/Leaderboard/LeaderboardFilter";
import { LeaderboardTable } from "@screens/Leaderboard/LeaderboardTable/LeaderboardTable";

const Leaderboard = observer(() => {
  return (
    <LeaderboardContainer>
      <LeaderboardContent>
        <LeaderboardFilter />
        <LeaderboardTable />
      </LeaderboardContent>
      <StatusBar />
    </LeaderboardContainer>
  );
});

export default Leaderboard;

const LeaderboardContent = styled(Column)`
  width: 100%;
`;

const LeaderboardContainer = styled(Column)`
  width: 90%;
  gap: 10px;
  height: 100%;
  margin: 0px auto;
  justify-content: space-between;
`;
