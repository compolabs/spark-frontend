import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex.tsx";

import { CompetitionsInfo } from "@screens/Competitions/CompetitionsInfo.tsx";
import { CompetitionsTable } from "@screens/Competitions/CompetitionsTable/CompetitionsTable.tsx";
import StatusBar from "@screens/SpotScreen/StatusBar";

const Competitions = observer(() => {
  return (
    <CompetitionsContainer>
      <CompetitionsContent>
        <CompetitionsInfo />
        <CompetitionsTable />
      </CompetitionsContent>
      <StatusBar />
    </CompetitionsContainer>
  );
});

export default Competitions;

const CompetitionsContent = styled(Column)`
  width: 100%;
`;

const CompetitionsContainer = styled(Column)`
  width: 90%;
  gap: 10px;
  height: 100%;
  margin: 0px auto;
  justify-content: space-between;
`;
