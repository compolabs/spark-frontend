import React, { useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button";
import { Column } from "@components/Flex";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";

import { useStores } from "@stores";
import { FiltersProps } from "@stores/DashboardStore";

import { filters } from "@screens/Dashboard/const";
import { DashboardInfo } from "@screens/Dashboard/DashboardInfo";
export const DashboardFilter = observer(() => {
  const [active, setActive] = useState(0);
  const { dashboardStore, settingsStore } = useStores();

  const handleClick = (filter: FiltersProps, index: number) => {
    setActive(index);
    dashboardStore.setActiveTime(filter);
  };
  const isInfoDashboardPerHours = settingsStore.isInfoDashboardPerHours;
  const portfolioVolume = dashboardStore.getChartDataPortfolio();
  const sumStatsUser = portfolioVolume[portfolioVolume.length - 1];
  return (
    <DashboardTitleContainer>
      <DashboardFilterContainer>
        <TitleText type={TEXT_TYPES.H} primary>
          Balance
        </TitleText>
        <SmartFlex gap="5px">
          {filters.map((filter, index) => (
            <FilterButton key={filter.title} grey={active === index} onClick={() => handleClick(filter, index)}>
              {filter.title}
            </FilterButton>
          ))}
        </SmartFlex>
      </DashboardFilterContainer>
      <TitleTextBalance type={TEXT_TYPES.H} primary>
        {`$${sumStatsUser?.value.toFixed(4) ?? 0}`}
      </TitleTextBalance>
      {!isInfoDashboardPerHours && <DashboardInfo />}
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
