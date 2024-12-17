import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";

import { LeaderBoardFilter } from "@screens/LeaderBoard/LeaderBoardFilter.tsx";
import { LeaderBoardTable } from "@screens/LeaderBoard/LeaderBoardTable/LeaderBoardTable.tsx";

const LeaderBoard = observer(() => {
  return (
    <LeaderBoardContainer>
      <LeaderBoardFilter />
      <LeaderBoardTable />
    </LeaderBoardContainer>
  );
});

export default LeaderBoard;

const LeaderBoardContainer = styled(Column)`
  width: 90%;
  margin: 0px auto;
  justify-content: space-between;
`;
