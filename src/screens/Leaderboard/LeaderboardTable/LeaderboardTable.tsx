import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Pagination } from "@components/Pagination/Pagination";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";

import { useStores } from "@stores";

import { LeaderboardItem } from "@screens/Leaderboard/LeaderboardTable/LeaderboardItem";

export const LeaderboardTable = observer(() => {
  const { leaderboardStore } = useStores();

  const header = [
    {
      name: "Place",
    },
    {
      name: "Wallet",
      flex: 1,
    },
    {
      name: `Volume ${leaderboardStore.activeFilter.title}`,
    },
  ];

  const data = leaderboardStore.leaderboard;
  const maxTotalCount = leaderboardStore.maxTotalCount;
  return (
    <LeaderboardTableContainer>
      <HeaderTable>
        {header.map((el) => (
          <HeaderItem key={el.name} flex={el?.flex}>
            {el.name}
          </HeaderItem>
        ))}
      </HeaderTable>
      {data.length > 0 ? (
        data.map((el, key) => <LeaderboardItem key={`${el.id}-${key}`} item={el} />)
      ) : (
        <NoData type={TEXT_TYPES.TEXT}>No Data</NoData>
      )}
      {maxTotalCount > 0 && (
        <Pagination
          currentPage={leaderboardStore.page}
          lengthData={maxTotalCount}
          onChange={leaderboardStore.setActivePage}
        />
      )}
    </LeaderboardTableContainer>
  );
});

const LeaderboardTableContainer = styled(SmartFlex)`
  margin-top: 12px;
  background: #171717;
  padding: 0px 8px;
  border: 1px solid ${({ theme }) => theme.colors.strokeSecondary};
  border-radius: 8px;
  width: 100%;
  flex-direction: column;
  min-height: 110px;
`;

const HeaderTable = styled(SmartFlex)`
  width: 100%;
  justify-content: space-between;
  margin-top: 12px;
`;

const HeaderItem = styled(Text)<{ flex?: number }>`
  ${({ flex }) => flex && `flex: ${flex};`}
  margin-right: 15px;
  &:first-child {
    margin-left: 8px;
  }
`;

const NoData = styled(Text)`
  margin-top: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
