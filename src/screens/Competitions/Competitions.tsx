import React from "react";
import styled from "@emotion/styled";
import dayjs from "dayjs";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";

import { CompetitionsInfo } from "@screens/Competitions/CompetitionsInfo";
import { CompetitionsTable } from "@screens/Competitions/CompetitionsTable/CompetitionsTable";
import setting from "@screens/Competitions/setting.json";
import StatusBar from "@screens/SpotScreen/StatusBar";

const Competitions = observer(() => {
  const now = dayjs();
  const live = now.isBefore(dayjs(setting.startDate))
    ? "Pending"
    : now.isAfter(dayjs(setting.endDate))
      ? "Ended"
      : "Live";

  return (
    <CompetitionsContainer>
      <CompetitionsContent>
        <CompetitionsInfo live={live} />
        <CompetitionsTable live={live} />
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
