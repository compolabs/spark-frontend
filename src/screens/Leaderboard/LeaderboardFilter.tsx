import React, { useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button";
import { Column } from "@components/Flex";
import SearchInput from "@components/SearchInput";
import Select from "@components/Select";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";
import { FiltersProps } from "@stores/DashboardStore";

import { filters } from "../Competitions/const";

export const LeaderboardFilter = observer(() => {
  const [active, setActive] = useState(0);
  const { leaderboardStore } = useStores();
  const media = useMedia();

  const handleClick = (filter: FiltersProps, index: number) => {
    setActive(index);
    leaderboardStore.setActiveFilter(filter);
  };
  return (
    <DashboardTitleContainer>
      <DashboardFilterContainer>
        <SmartFlex gap="8px" column>
          <TitleText type={TEXT_TYPES.H} primary>
            Leaderboard
          </TitleText>
          <TitleText type={TEXT_TYPES.TEXT} primary>
            Top 100 V12 traders by total volume (spot)
          </TitleText>
        </SmartFlex>
        <SmartFlex gap="5px">
          <SearchInput
            placeholder="Wallet Address"
            value={leaderboardStore.searchWallet}
            onChange={leaderboardStore.setSearchWallet}
          />
          {media.mobile ? (
            <StyledSelect
              options={filters.map((value, index) => ({
                title: value.title,
                key: index.toString(),
                value: value.value,
              }))}
              selected={String(active)}
              onSelect={(val, index) => {
                handleClick(
                  {
                    title: val.title as string,
                    value: val.value as number,
                  },
                  index,
                );
              }}
            />
          ) : (
            filters.map((filter, index) => (
              <FilterButton key={filter.title} grey={active === index} onClick={() => handleClick(filter, index)}>
                {filter.title}
              </FilterButton>
            ))
          )}
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
  ${media.mobile} {
    flex-direction: column;
    height: 100px;
  }
`;

const FilterButton = styled(Button)`
  width: auto;
  height: 30px !important;
`;

const TitleText = styled(Text)`
  display: flex;
  align-items: center;
`;

const StyledSelect = styled(Select<string>)`
  min-width: 74px;
  height: 40px;
`;
