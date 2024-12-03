import React, { useState } from "react";
import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";

import { Pagination } from "@components/Pagination/Pagination";
import BottomTablesSkeletonWrapper from "@components/Skeletons/BottomTablesSkeletonWrapper";
import { SmartFlex } from "@components/SmartFlex";
import Table from "@components/Table";
import Text, { TEXT_TYPES } from "@components/Text";

import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";
import { PAGINATION_LIMIT } from "@stores/SpotTableStore";

import { BaseTable } from "../BaseTable";

import { MobileTableRows, TABLE_TYPE } from "./SpotTableMobileRow";
import { PaginationContainer, TextGraph } from "./styles";
import { HISTORY_COLUMNS, ORDER_COLUMNS } from "./TablesHelper";

const PAGINATION_START_PAGE = 1;

const SpotTable: React.FC = observer(() => {
  const { accountStore, settingsStore, spotTableStore } = useStores();
  const theme = useTheme();
  const media = useMedia();
  const [tabIndex, setTabIndex] = useState(0);
  const [page, setPage] = useState(PAGINATION_START_PAGE);

  const tabsConfig = [
    {
      title: "ORDERS",
      type: TABLE_TYPE.ORDER_DATA,
      data: spotTableStore.userOrders,
      count: spotTableStore.userOrdersStats?.active ?? 0,
      columns: ORDER_COLUMNS(spotTableStore, theme),
    },
    {
      title: "HISTORY",
      type: TABLE_TYPE.HISTORY,
      data: spotTableStore.userOrdersHistory,
      count: (spotTableStore.userOrdersStats?.closed ?? 0) + (spotTableStore.userOrdersStats?.canceled ?? 0),
      columns: HISTORY_COLUMNS(theme),
    },
  ];

  const TABS = tabsConfig.map((tab) => ({
    title: tab.title,
    disabled: false,
    rowCount: tab.count,
  }));

  const tab = tabsConfig[tabIndex];
  const data = tab.data;
  const type = tab.type;
  const columns = tab.columns;

  const shouldRenderPagination = data.length >= PAGINATION_LIMIT || page > PAGINATION_START_PAGE - 1;

  const handleTab = (tabIndex: number) => {
    setTabIndex(tabIndex);
    setPage(1);
    spotTableStore.setOffset(0);
  };

  const handleChangePagination = (newPage: number) => {
    setPage(newPage);
    spotTableStore.setOffset(newPage);
  };

  const renderTable = () => {
    if (!data.length) {
      return (
        <SmartFlex height="100%" padding={media.mobile ? "16px" : "32px"} width="100%" center>
          <Text type={TEXT_TYPES.BUTTON_SECONDARY} secondary>
            No Data
          </Text>
        </SmartFlex>
      );
    }

    return media.mobile ? <MobileTableRows data={data} type={type} /> : <Table columns={columns} data={data} />;
  };

  return (
    <BottomTablesSkeletonWrapper
      isReady={spotTableStore.initialized || !accountStore.isConnected}
      size={settingsStore.tradeTableSize}
    >
      <BaseTable activeTab={tabIndex} tabs={TABS} onTabClick={handleTab}>
        {renderTable()}
      </BaseTable>
      {shouldRenderPagination && (
        <PaginationContainer>
          <Pagination currentPage={page} lengthData={TABS[tabIndex].rowCount} onChange={handleChangePagination} />
        </PaginationContainer>
      )}
      {!!spotTableStore.userOrders.length && tabIndex === 0 && (
        <TextGraph style={{ textAlign: "center" }}>Data provided by Envio</TextGraph>
      )}
    </BottomTablesSkeletonWrapper>
  );
});

export default SpotTable;
