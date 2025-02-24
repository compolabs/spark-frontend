import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Loader from "@components/Loader";
import { Pagination } from "@components/Pagination/Pagination";
import Select from "@components/Select";
import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";

import ArrowFilterIcon from "@assets/icons/arrowFilter.svg?react";

import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";
import { PAGINATION_PER_PAGE } from "@stores/LeaderboardStore";

import { LeaderboardItem, LeaderboardItemMobile } from "@screens/Leaderboard/LeaderboardTable/LeaderboardItem";

export const LeaderboardTable = observer(() => {
  const { leaderboardStore } = useStores();
  const media = useMedia();

  const header = [
    {
      field: "place",
      name: "Place",
    },
    {
      field: "wallet",
      name: "Wallet",
      flex: 1,
    },
    {
      field: "pnl",
      name: `Pnl (${leaderboardStore.activeFilter.title})`,
      flex: 0.4,
      // onClick: () => leaderboardStore.makeSort("pnl"),
    },
    {
      field: "volume",
      name: `Volume (${leaderboardStore.activeFilter.title})`,
      onClick: () => leaderboardStore.makeSort("volume"),
    },
  ];

  const data = leaderboardStore.leaderboard;
  const maxTotalCount = leaderboardStore.maxTotalCount;
  const onSelectOrderPerPage = (page: any) => {
    leaderboardStore.setOrderPerPage(page);
  };

  const generateFilterIcon = (field: string) => {
    if (field === leaderboardStore.sortLeaderboard.field) {
      if (leaderboardStore.sortLeaderboard.side === "DESC") return <ArrowFilterIcon />;
      return <ArrowFilterIcon style={{ transform: "rotate(180deg)" }} />;
    }
    return;
  };
  return (
    <LeaderboardTableContainer>
      {media.desktop && (
        <HeaderTable>
          {header.map((el) => (
            <HeaderItem key={el.name} flex={el?.flex} isActive={!!el?.onClick} onClick={el?.onClick}>
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
            <LeaderboardItemMobile key={`${el.id}-${key}`} item={el} />
          ) : (
            <LeaderboardItem key={`${el.id}-${key}`} item={el} />
          ),
        )
      ) : (
        <NoData type="TEXT">No Data</NoData>
      )}
      {maxTotalCount > 0 && (
        <FooterTable>
          <Pagination
            currentPage={leaderboardStore.page}
            lengthData={maxTotalCount}
            limit={leaderboardStore.orderPerPage.key}
            onChange={leaderboardStore.setActivePage}
          />
          <SmartFlex alignItems="center">
            <Text type="BUTTON">SHOW:</Text>
            <SelectStyled
              options={PAGINATION_PER_PAGE}
              selected={leaderboardStore.orderPerPage.key}
              onSelect={onSelectOrderPerPage}
            />
          </SmartFlex>
        </FooterTable>
      )}
    </LeaderboardTableContainer>
  );
});

const FooterTable = styled(SmartFlex)`
  justify-content: space-between;
  align-items: center;
`;
const LeaderboardTableContainer = styled(SmartFlex)`
  margin-top: 12px;
  background: #171717;
  padding: 0 8px;
  border: 1px solid ${({ theme }) => theme.colors.strokeSecondary};
  border-radius: 8px;
  width: 100%;
  flex-direction: column;
  min-height: 110px;
  position: relative;
`;

const HeaderTable = styled(SmartFlex)`
  width: 100%;
  justify-content: space-between;
  margin-top: 12px;
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
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SelectStyled = styled(Select)`
  background: #171717;
  border: none;
  font-size: 14px;
`;

const LoaderContainer = styled(SmartFlex)`
  position: absolute;
  height: 100%;
  width: 100%;
  backdrop-filter: blur(10px);
`;
