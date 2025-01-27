import React, { useEffect, useState } from "react";
import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";

import { BaseTable } from "@components/BaseTable";
import { Pagination } from "@components/Pagination/Pagination";
import BottomTablesSkeletonWrapper from "@components/Skeletons/BottomTablesSkeletonWrapper";
import Table from "@components/Table";
import Text, { TEXT_TYPES } from "@components/Text";

import { useStores } from "@stores";
import { PAGINATION_LIMIT } from "@stores/SpotTableStore";

import { TABLE_TYPE } from "./PerpTableMobileRow";
import { TableContainer } from "./styles";
import { ORDER_COLUMNS, POSITIONS_COLUMNS } from "./TablesHelper";

const PAGINATION_START_PAGE = 1;

const SpotTable: React.FC = observer(() => {
  const { accountStore, settingsStore, perpTableStore } = useStores();
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);
  const [page, setPage] = useState(PAGINATION_START_PAGE);

  const tabsConfig = [
    {
      title: "POSITIONS",
      type: TABLE_TYPE.ORDER_DATA,
      data: perpTableStore.userOpenPosition,
      count: perpTableStore.userOrdersStats?.active ?? 0,
      columns: POSITIONS_COLUMNS(theme),
    },
    {
      title: "ORDERS",
      type: TABLE_TYPE.HISTORY,
      data: perpTableStore.userOrders,
      count: perpTableStore.userOrdersStats?.active ?? 0,
      columns: ORDER_COLUMNS(),
    },
  ];

  const TABS = tabsConfig.map((tab) => ({
    title: tab.title,
    disabled: false,
    rowCount: tab.count,
  }));

  useEffect(() => {
    perpTableStore.resetCounter();
  }, [accountStore.isConnected]);

  const tab = tabsConfig[tabIndex];
  const data = tab.data;
  const columns = tab.columns;

  const shouldRenderPagination = data.length >= PAGINATION_LIMIT || page > PAGINATION_START_PAGE - 1;

  const handleTab = (tabIndex: number) => {
    setTabIndex(tabIndex);
    setPage(1);
    perpTableStore.setOffset(0);
  };

  const handleChangePagination = (newPage: number) => {
    setPage(newPage);
    perpTableStore.setOffset(newPage);
  };

  const renderTable = () => {
    if (!data.length) {
      return (
        <TableContainer center column>
          <Text type={TEXT_TYPES.H} primary>
            You haven&apos;t made any trades so far
          </Text>
          <Text type={TEXT_TYPES.BODY} secondary>
            Begin trading to view updates on your portfolio
          </Text>
        </TableContainer>
      );
    }
    return <Table columns={columns} data={data} />;
    // return media.mobile ? <MobileTableRows data={data} type={type} /> : <Table columns={columns} data={data} />;
  };

  return (
    <BottomTablesSkeletonWrapper
      // isReady={spotTableStore.initialized || !accountStore.isConnected}
      isReady={true}
      size={settingsStore.tradeTableSize}
    >
      <BaseTable activeTab={tabIndex} tabs={TABS} onTabClick={handleTab}>
        {renderTable()}
      </BaseTable>
      {shouldRenderPagination && (
        <Pagination currentPage={page} lengthData={TABS[tabIndex].rowCount} onChange={handleChangePagination} />
      )}
    </BottomTablesSkeletonWrapper>
  );
});

export default SpotTable;
