import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Loader from "@components/Loader";
import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";

import ArrowFilterIcon from "@assets/icons/arrowFilter.svg?react";

import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";

import { StatsItem, StatsItemMobile } from "@screens/Stats/StatsTable/StatsItem";

export const StatsTable = observer(() => {
  const { leaderboardStore } = useStores();
  const media = useMedia();

  const header = [
    {
      field: "market",
      name: "Market",
    },
    {
      field: "price",
      name: "Price",
      // flex: 1,
    },
    {
      field: "24h Change",
      name: "24h Change",
      // flex: 0.4,
      // onClick: () => leaderboardStore.makeSort("pnl"),
    },
    {
      field: "volume",
      name: "24h Volume",
      onClick: () => leaderboardStore.makeSortStat("volume"),
    },
    {
      field: "7d Volume",
      name: "7d Volume",
      // flex: 0.4,
      // onClick: () => leaderboardStore.makeSort("pnl"),
    },
  ];

  const data = leaderboardStore.totalStatsTableData;

  const generateFilterIcon = (field: string) => {
    if (field === leaderboardStore.sortStats.field) {
      if (leaderboardStore.sortStats.side === "DESC") return <ArrowFilterIcon />;
      return <ArrowFilterIcon style={{ transform: "rotate(180deg)" }} />;
    }
    return;
  };
  return (
    <StatsTableContainer>
      {media.desktop && (
        <HeaderTable>
          {header.map((el) => (
            <HeaderItem key={el.name} flex={1} isActive={!!el?.onClick} type="BUTTON" onClick={el?.onClick}>
              {el.name} {generateFilterIcon(el.field)}
            </HeaderItem>
          ))}
        </HeaderTable>
      )}
      {leaderboardStore.isLoading && (
        <LoaderContainer>
          <Loader />
        </LoaderContainer>
      )}
      {data.length > 0 ? (
        data.map((el, key) =>
          media.mobile ? (
            <StatsItemMobile key={`${el.market}-${key}`} item={el} />
          ) : (
            <StatsItem key={`${el.market}-${key}`} item={el} />
          ),
        )
      ) : (
        <NoData type="TEXT">No Data</NoData>
      )}
    </StatsTableContainer>
  );
});

const StatsTableContainer = styled(SmartFlex)`
  margin-top: 12px;
  margin-bottom: 32px;
  background: #171717;
  padding: 0px 8px;
  border: 1px solid ${({ theme }) => theme.colors.strokeSecondary};
  border-radius: 8px;
  width: 100%;
  flex-direction: column;
  position: relative;
`;

const HeaderTable = styled(SmartFlex)`
  width: 100%;
  justify-content: space-between;
  margin: 20px 0;
  height: 32px;
`;

const HeaderItem = styled(Text)<{ flex?: number; isActive?: boolean }>`
  ${({ flex }) => flex && `flex: ${flex};`}
  ${({ isActive }) =>
    isActive &&
    `
    &:hover {
       cursor: pointer;
    }
  `}
  margin-right: 15px;
  &:first-child {
    margin-left: 8px;
  }
`;

const NoData = styled(Text)`
  margin-top: 30px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoaderContainer = styled(SmartFlex)`
  position: absolute;
  height: 100%;
  width: 100%;
  backdrop-filter: blur(10px);
`;
