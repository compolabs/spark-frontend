import styled from "@emotion/styled";
import { SmartFlex } from "@components/SmartFlex.tsx";
import { LeaderBoardItem } from "@screens/LeaderBoard/LeaderBoardTable/LeaderBoardItem.tsx";
import { Pagination } from "@components/Pagination/Pagination.tsx";
import React from "react";
import { useStores } from "@stores";

const data = [
  {
    key: 1,
    add: '0x4F9e...c1a8',
    volume: '$213'
  },
  {
    key: 2,
    add: '0x4F9e...c1a8',
    volume: '$3223'
  },
  {
    key: 2,
    add: '0x4F9e...c1a8',
    volume: '$3223'
  },
  {
    key: 2,
    add: '0x4F9e...c1a8',
    volume: '$3223'
  }
]
export const LeaderBoardTable = () => {
  const { leaderBoardStore } = useStores();
  return (
      <LeaderBoardTableContainer>
      {data.map((el) => <LeaderBoardItem item={el} />)}
        <Pagination currentPage={0} lengthData={10} onChange={() => {}} />
    </LeaderBoardTableContainer>
    )
}

const LeaderBoardTableContainer = styled(SmartFlex)`
    margin-top: 12px;
    background: #171717;
    padding: 0px 8px;
    border: 1px solid ${({ theme }) => theme.colors.strokeSecondary};
    border-radius: 8px;
    width: 100%;
    flex-direction: column;
`