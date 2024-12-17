import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";

import { LeaderboardFilter } from "@screens/Leaderboard/LeaderboardFilter";
import { LeaderboardTable } from "@screens/Leaderboard/LeaderboardTable/LeaderboardTable";

const Leaderboard = observer(() => {
  return (
    <LeaderboardContainer>
      <LeaderboardFilter />
      <LeaderboardTable />
    </LeaderboardContainer>
  );
});

export default Leaderboard;

const LeaderboardContainer = styled(Column)`
  width: 90%;
  margin: 0px auto;
  justify-content: space-between;
`;
