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

import BN from "@utils/BN";

import { TABLE_TYPE } from "./PerpTableMobileRow";
import { TableContainer } from "./styles";
import { ORDER_COLUMNS, POSITIONS_COLUMNS } from "./TablesHelper";

const PAGINATION_START_PAGE = 1;

const mock = {
  position: {
    data: [
      {
        baseToken: {
          name: "Ethereum",
          symbol: "ETH",
          decimals: 9,
          logo: "/src/assets/tokens/ethereum.svg",
          assetId: "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07",
          priceFeed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
          precision: 9,
        },
        quoteToken: {
          name: "USDC",
          symbol: "USDC",
          decimals: 6,
          logo: "/src/assets/tokens/usdc.svg",
          assetId: "0x336b7c06352a4b736ff6f688ba6885788b3df16e136e95310ade51aa32dc6f05",
          priceFeed: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
          precision: 2,
        },
        takerPositionSize: new BN(0.89),
        entrySizeValue: new BN(1719.21),
        margin: new BN(75.6255),
        entryPrice: new BN(1720.23),
        markPrice: new BN(1789.8),
        unrealizedPnl: new BN(64.1617),
        unrealizedPnlPercent: new BN(85.52),
        pendingFundingPayment: new BN(0),
        type: "Long",
        isUnrealizedPnlInProfit: true,
        symbol: "ETH-USDC",
        leverage: "20",
      },
    ],
  },
};
const SpotTable: React.FC = observer(() => {
  const { accountStore, settingsStore, perpTableStore } = useStores();
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);
  const [page, setPage] = useState(PAGINATION_START_PAGE);
  console.log('perpTableStore', perpTableStore.userOrders)
  const tabsConfig = [
    {
      title: "POSITIONS",
      type: TABLE_TYPE.ORDER_DATA,
      data: mock.position.data,
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
