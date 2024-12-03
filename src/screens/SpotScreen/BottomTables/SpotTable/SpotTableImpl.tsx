import React, { useEffect, useState } from "react";
import { Theme, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { createColumnHelper } from "@tanstack/react-table";
import { observer } from "mobx-react";

import Chip from "@components/Chip";
import { Pagination } from "@components/Pagination/Pagination";
import { SmartFlex } from "@components/SmartFlex";
import Table from "@components/Table";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";

import { toCurrency } from "@utils/toCurrency";

import { SpotMarketOrder } from "@entity";

import BottomTablesSkeletonWrapper from "../../../../components/Skeletons/BottomTablesSkeletonWrapper";
import { BaseTable } from "../BaseTable";

import { useSpotTableVMProvider } from "./SpotTableVM";

const orderColumnHelper = createColumnHelper<SpotMarketOrder>();
const tradeColumnHelper = createColumnHelper<SpotMarketOrder>();

const ORDER_COLUMNS = (vm: ReturnType<typeof useSpotTableVMProvider>, theme: Theme) => [
  orderColumnHelper.accessor("timestamp", {
    header: "Date",
    cell: (props) => props.getValue().format("DD MMM YY, HH:mm"),
  }),
  orderColumnHelper.accessor("marketSymbol", {
    header: "Pair",
  }),
  orderColumnHelper.accessor("orderType", {
    header: "Type",
    cell: (props) => (
      <TableText color={props.getValue() === "Sell" ? theme.colors.redLight : theme.colors.greenLight}>
        {props.getValue()}
      </TableText>
    ),
  }),
  orderColumnHelper.accessor("formatInitialAmount", {
    header: "Amount",
    cell: (props) => (
      <SmartFlex center="y" gap="4px">
        <TableText primary>{props.getValue()}</TableText>
        <TokenBadge>
          <Text>{props.row.original.baseToken.symbol}</Text>
        </TokenBadge>
      </SmartFlex>
    ),
  }),
  orderColumnHelper.accessor("formatFilledAmount", {
    id: "filled",
    header: "Filled",
    cell: (props) => (
      <SmartFlex center="y" gap="4px">
        <TableText primary>{props.getValue()}</TableText>
        <TokenBadge>
          <Text>{props.row.original.baseToken.symbol}</Text>
        </TokenBadge>
      </SmartFlex>
    ),
  }),
  orderColumnHelper.accessor("formatPrice", {
    header: "Price",
    cell: (props) => toCurrency(props.getValue()),
  }),
  orderColumnHelper.accessor("id", {
    header: "",
    id: "action",
    cell: (props) => (
      <CancelButton
        data-order-id={props.getValue()}
        style={{
          minWidth: "92px",
        }}
        onClick={() => vm.cancelOrder(props.row.original)}
      >
        {vm.cancelingOrderId === props.getValue() ? "Loading..." : "Cancel"}
      </CancelButton>
    ),
  }),
];

const HISTORY_COLUMNS = (theme: Theme) => [
  tradeColumnHelper.accessor("timestamp", {
    header: "Date",
    cell: (props) => props.getValue().format("DD MMM YY, HH:mm"),
  }),
  tradeColumnHelper.accessor("marketSymbol", {
    header: "Pair",
  }),
  tradeColumnHelper.accessor("orderType", {
    header: "Type",
    cell: (props) => (
      <TableText color={props.getValue() === "Sell" ? theme.colors.redLight : theme.colors.greenLight}>
        {props.getValue()}
      </TableText>
    ),
  }),
  tradeColumnHelper.accessor("formatInitialAmount", {
    header: "Amount",
    cell: (props) => (
      <SmartFlex center="y" gap="4px">
        <TableText primary>{props.getValue()}</TableText>
        <TokenBadge>
          <Text>{props.row.original.baseToken.symbol}</Text>
        </TokenBadge>
      </SmartFlex>
    ),
  }),
  tradeColumnHelper.accessor("formatPrice", {
    header: "Price",
    cell: (props) => toCurrency(props.getValue()),
  }),
];

const minNeedLengthPagination = 10;
const startPage = 1;
// todo: Упростить логику разделить формирование данных и рендер для декстопа и мобилок
const SpotTableImpl: React.FC = observer(() => {
  const { accountStore, settingsStore } = useStores();
  const vm = useSpotTableVMProvider();
  const theme = useTheme();
  const media = useMedia();
  const [tabIndex, setTabIndex] = useState(0);
  const columns = [ORDER_COLUMNS(vm, theme), HISTORY_COLUMNS(theme)];
  const [page, setPage] = useState(startPage);
  const historyOrders = (vm.userOrdersStats?.closed ?? 0) + (vm.userOrdersStats?.canceled ?? 0);
  const openOrders = vm.userOrdersStats?.active ?? 0;
  const TABS = [
    { title: "ORDERS", disabled: false, rowCount: openOrders },
    { title: "HISTORY", disabled: false, rowCount: historyOrders },
  ];

  useEffect(() => {
    vm.resetCounter();
  }, [accountStore.isConnected]);

  const handleTab = (e: number) => {
    setTabIndex(e);
    setPage(1);
    vm.setOffset(0);
  };

  const renderMobileRows = () => {
    const orderData = vm.userOrders.map((ord, i) => (
      <MobileTableOrderRow key={i + "mobile-row"}>
        <MobileTableRowColumn>
          <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON_SECONDARY}>
            {ord.marketSymbol}
          </Text>
          <SmartFlex gap="2px" column>
            <Text type={TEXT_TYPES.SUPPORTING}>Amount</Text>
            <SmartFlex center="y" gap="4px">
              <Text color={theme.colors.textPrimary}>{ord.formatInitialAmount}</Text>
              <TokenBadge>
                <Text>{ord.baseToken.symbol}</Text>
              </TokenBadge>
            </SmartFlex>
          </SmartFlex>
        </MobileTableRowColumn>
        <MobileTableRowColumn>
          <Text color={theme.colors.textPrimary}>Active</Text>
          <SmartFlex gap="2px" column>
            <SmartFlex center="y" gap="4px">
              <Text type={TEXT_TYPES.SUPPORTING}>Side:</Text>
              <TableText color={ord.orderType === "Sell" ? theme.colors.redLight : theme.colors.greenLight}>
                {ord.orderType}
              </TableText>
            </SmartFlex>
          </SmartFlex>
        </MobileTableRowColumn>
        <MobileTableRowColumn>
          <CancelButton onClick={() => vm.cancelOrder(ord)}>
            {vm.cancelingOrderId === ord.id ? "Loading..." : "Cancel"}
          </CancelButton>
          <SmartFlex alignItems="flex-end" gap="2px" column>
            <Text type={TEXT_TYPES.SUPPORTING}>Price:</Text>
            <Text color={theme.colors.textPrimary}>{toCurrency(ord.formatPrice)}</Text>
          </SmartFlex>
        </MobileTableRowColumn>
      </MobileTableOrderRow>
    ));

    const orderHistoryData = vm.userOrdersHistory.map((ord, i) => (
      <MobileTableOrderRow key={i + "mobile-history-row"}>
        <MobileTableRowColumn>
          <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON_SECONDARY}>
            {ord.marketSymbol}
          </Text>
          <SmartFlex gap="2px" column>
            <Text type={TEXT_TYPES.SUPPORTING}>Amount</Text>
            <SmartFlex center="y" gap="4px">
              <Text color={theme.colors.textPrimary}>{ord.formatInitialAmount}</Text>
              <TokenBadge>
                <Text>{ord.baseToken.symbol}</Text>
              </TokenBadge>
            </SmartFlex>
          </SmartFlex>
        </MobileTableRowColumn>
        <MobileTableRowColumn>
          <Text color={theme.colors.textPrimary}>Complete</Text>
          <SmartFlex gap="2px" column>
            <SmartFlex center="y" gap="4px">
              <Text type={TEXT_TYPES.SUPPORTING}>Side:</Text>
              <TableText color={ord.orderType === "Sell" ? theme.colors.redLight : theme.colors.greenLight}>
                {ord.orderType}
              </TableText>
            </SmartFlex>
            <SmartFlex center="y" gap="4px">
              <Text type={TEXT_TYPES.SUPPORTING}>Filled:</Text>
              <SmartFlex center="y" gap="4px">
                <Text color={theme.colors.textPrimary}>{ord.formatCurrentAmount}</Text>
                <TokenBadge>
                  <Text>{ord.baseToken.symbol}</Text>
                </TokenBadge>
              </SmartFlex>
            </SmartFlex>
          </SmartFlex>
        </MobileTableRowColumn>
        <MobileTableRowColumn>
          <SmartFlex alignItems="flex-end" gap="2px" column>
            <Text type={TEXT_TYPES.SUPPORTING}>Price:</Text>
            <Text color={theme.colors.textPrimary}>{toCurrency(ord.formatPrice)}</Text>
          </SmartFlex>
        </MobileTableRowColumn>
      </MobileTableOrderRow>
    ));

    const tabToData = [orderData, orderHistoryData];

    return (
      <SmartFlex width="100%" column>
        {tabToData[tabIndex]}
      </SmartFlex>
    );
  };

  const tabToData = [vm.userOrders, vm.userOrdersHistory];
  const data = tabToData[tabIndex];
  const handleChangePagination = (e: number) => {
    vm.setOffset(e);
    setPage(e);
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

    if (media.mobile) {
      return renderMobileRows();
    }
    return <Table columns={columns[tabIndex] as any} data={data} />;
  };

  return (
    <BottomTablesSkeletonWrapper
      isReady={vm.initialized || !accountStore.isConnected}
      size={settingsStore.tradeTableSize}
    >
      <BaseTable activeTab={tabIndex} tabs={TABS} onTabClick={handleTab}>
        {renderTable()}
      </BaseTable>
      {data.length >= minNeedLengthPagination || page > startPage - 1 ? (
        <Pagination currentPage={page} lengthData={openOrders} onChange={handleChangePagination} />
      ) : null}
      {/*{!!vm.userOrders.length && tabIndex === 0 && (*/}
      {/*  //todo здесь была кнопка cancel all orders*/}
      {/*)}*/}
    </BottomTablesSkeletonWrapper>
  );
});

export default SpotTableImpl;

export const TableText = styled(Text)`
  display: flex;
  align-items: center;
`;

const TableContainer = styled(SmartFlex)`
  text-align: center;
  gap: 10px;
  height: 100%;
  width: 100%;
  padding: 32px;
  ${media.mobile} {
    padding: 16px;
  }
`;

const CancelButton = styled(Chip)`
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary} !important;
`;

const MobileTableOrderRow = styled(SmartFlex)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  padding: 11px 7px 14px 7px;
  background: ${({ theme }) => theme.colors.bgPrimary};

  position: relative;

  &:not(:last-of-type)::after {
    content: "";

    position: absolute;
    bottom: 0;
    width: 100%;

    height: 1px;
    box-shadow: inset 0 1px 0 0 ${({ theme }) => theme.colors.bgSecondary};
  }
`;

const MobileTableRowColumn = styled(SmartFlex)`
  flex-direction: column;
  gap: 7px;

  &:last-of-type {
    align-items: flex-end;
  }
`;

const TokenBadge = styled(SmartFlex)`
  padding: 4px 8px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 4px;

  ${Text} {
    line-height: 10px;
  }
`;
