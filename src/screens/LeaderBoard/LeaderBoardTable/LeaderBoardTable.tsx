import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Pagination } from "@components/Pagination/Pagination.tsx";
import { SmartFlex } from "@components/SmartFlex.tsx";

import { useStores } from "@stores";

import { LeaderBoardItem } from "@screens/LeaderBoard/LeaderBoardTable/LeaderBoardItem.tsx";

export const LeaderBoardTable = observer(() => {
  const { leaderBoardStore } = useStores();
  const data = leaderBoardStore.leaderBoard;
  const maxTotalCount = data.reduce((max, item) => {
    return item?.totalCount > max ? item.totalCount : max;
  }, 0);
  return (
    <LeaderBoardTableContainer>
      {data.map((el, key) => (
        <LeaderBoardItem key={`${el.id}-${key}`} item={el} />
      ))}
      {maxTotalCount > 0 && (
        <Pagination
          currentPage={leaderBoardStore.page}
          lengthData={maxTotalCount}
          onChange={leaderBoardStore.setActivePage}
        />
      )}
    </LeaderBoardTableContainer>
  );
});

const LeaderBoardTableContainer = styled(SmartFlex)`
  margin-top: 12px;
  background: #171717;
  padding: 0px 8px;
  border: 1px solid ${({ theme }) => theme.colors.strokeSecondary};
  border-radius: 8px;
  width: 100%;
  flex-direction: column;
`;
