import React, { useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button.tsx";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";

import { useStores } from "@stores";
import { FiltersProps } from "@stores/DashboardStore.ts";

import { filters } from "@screens/Dashboard/const.ts";
export const DashboardFilter = observer(() => {
  const [active, setActive] = useState(0);
  const { dashboardStore } = useStores();
  console.log("dashboardStore", dashboardStore.activeTime);

  const handleClick = (filter: FiltersProps, index: number) => {
    setActive(index);
    dashboardStore.setActiveTime(filter);
  };
  return (
    <DashboardFilterContainer>
      <TitleText type={TEXT_TYPES.H} primary>
        Portfolio
      </TitleText>
      <SmartFlex gap="5px">
        {filters.map((filter, index) => (
          <FilterButton key={filter.title} grey={active === index} onClick={() => handleClick(filter, index)}>
            {filter.title}
          </FilterButton>
        ))}
      </SmartFlex>
    </DashboardFilterContainer>
  );
});

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
