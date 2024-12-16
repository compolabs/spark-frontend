import React, { useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button";
import { Column } from "@components/Flex";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";

import { useStores } from "@stores";
import { FiltersProps } from "@stores/DashboardStore";

import { filters } from "./const";

export const LeaderBoardFilter = observer(() => {
  const [active, setActive] = useState(0);
  const { leaderBoardStore, settingsStore } = useStores();

  const handleClick = (filter: FiltersProps, index: number) => {
    setActive(index);
    // leaderBoardStore.setActiveTime(filter);
  };
  const isInfoDashboardPerHours = settingsStore.isInfoDashboardPerHours;
  // const portfolioVolume = leaderBoardStore.getChartDataPortfolio();
  // const sumStatsUser = portfolioVolume[portfolioVolume.length - 1];
  return (
    <DashboardTitleContainer>
      <DashboardFilterContainer>
        <SmartFlex column gap="8px">
        <TitleText type={TEXT_TYPES.H} primary>
          Leaderboard
        </TitleText>
          <TitleText type={TEXT_TYPES.TEXT} primary>
            Top 100 Spark traders by total volume (spot)
          </TitleText>
        </SmartFlex>
        <SmartFlex gap="5px">
          {filters.map((filter, index) => (
            <FilterButton key={filter.title} grey={active === index} onClick={() => handleClick(filter, index)}>
              {filter.title}
            </FilterButton>
          ))}
        </SmartFlex>
      </DashboardFilterContainer>
    </DashboardTitleContainer>
  );
});

const DashboardTitleContainer = styled(Column)`
  width: 100%;
`;

const DashboardFilterContainer = styled(SmartFlex)`
  width: 100%;
  margin-top: 32px;
  margin-bottom: 8px;
  height: 32px;
  justify-content: space-between;
`;

const FilterButton = styled(Button)`
  width: auto;
  height: 30px !important;
`;

const TitleText = styled(Text)`
  display: flex;
  align-items: center;
`;

const TitleTextBalance = styled(TitleText)`
  margin-bottom: 10px;
`;
