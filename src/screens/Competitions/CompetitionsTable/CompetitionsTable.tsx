import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Loader from "@components/Loader";
import { Pagination } from "@components/Pagination/Pagination";
import SearchInput from "@components/SearchInput";
import Select from "@components/Select";
import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";

import ArrowFilterIcon from "@assets/icons/arrowFilter.svg?react";

import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";
import { PAGINATION_PER_PAGE } from "@stores/LeaderboardStore";

import { CompetitionsItem, CompetitionsItemMobile } from "@screens/Competitions/CompetitionsTable/CompetitionsItem";

export const CompetitionsTable = observer(({ live }: { live: string }) => {
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
      name: `Pnl`,
      flex: 0.4,
      onClick: () => leaderboardStore.makeCompetitions("pnl"),
    },
    {
      field: "volume",
      name: `Volume`,
    },
  ];

  const data = leaderboardStore.competitionData;
  const maxTotalCount = leaderboardStore.maxTotalCount;
  const onSelectOrderPerPage = (page: any) => {
    leaderboardStore.setOrderPerPage(page);
  };

  const generateFilterIcon = (field: string) => {
    if (field === leaderboardStore.sortCompetitions.field) {
      if (leaderboardStore.sortCompetitions.side === "DESC") return <ArrowFilterIcon />;
      return <ArrowFilterIcon style={{ transform: "rotate(180deg)" }} />;
    }
    return;
  };

  if (live === "Pending") return;

  return (
    <>
      <CompetitionsTableHeader>
        <TitleText type="H" primary>
          Competition Leaderboard
        </TitleText>
        <SearchInput
          placeholder="Wallet Address"
          value={leaderboardStore.searchWallet}
          onChange={leaderboardStore.setSearchWallet}
        />
      </CompetitionsTableHeader>
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
              <CompetitionsItemMobile key={`${el.user}-${key}`} item={el} />
            ) : (
              <CompetitionsItem key={`${el.user}-${key}`} item={el} />
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
    </>
  );
});

const FooterTable = styled(SmartFlex)`
  justify-content: space-between;
  align-items: center;
`;

const LeaderboardTableContainer = styled(SmartFlex)`
  background: #171717;
  padding: 0px 8px;
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

const CompetitionsTableHeader = styled(SmartFlex)`
  width: 100%;
  gap: 10px;
  padding: 32px 0px 16px 0px;
  margin: 0px auto;
  justify-content: space-between;
`;

const TitleText = styled(Text)`
  display: flex;
  align-items: center;
`;
