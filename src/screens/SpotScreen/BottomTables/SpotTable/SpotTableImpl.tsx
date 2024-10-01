import React, { useState } from "react";
import { Theme, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { createColumnHelper } from "@tanstack/react-table";
import { observer } from "mobx-react";

import Chip from "@components/Chip";
import { Pagination } from "@components/Pagination/Pagination.tsx";
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
  const { accountStore } = useStores();
  const vm = useSpotTableVMProvider();
  const theme = useTheme();
  const media = useMedia();
  const [tabIndex, setTabIndex] = useState(0);
  const columns = [ORDER_COLUMNS(vm, theme), HISTORY_COLUMNS(theme)];
  const [page, setPage] = useState(startPage);
  const TABS = [
    { title: "ORDERS", disabled: false, rowCount: vm.myOrders.length },
    { title: "HISTORY", disabled: false, rowCount: vm.myOrdersHistory.length },
  ];

  const handleTab = (e: number) => {
    setTabIndex(e);
    setPage(1);
    vm.setOffset(0);
  };

  const renderMobileRows = () => {
    const orderData = vm.myOrders.map((ord, i) => (
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

    const orderHistoryData = vm.myOrdersHistory.map((ord, i) => (
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

  const tabToData = [vm.myOrders, vm.myOrdersHistory];
  const data = tabToData[tabIndex];

  const handleChangePagination = (e: number) => {
    vm.setOffset(e);
    setPage(e);
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

    if (media.mobile) {
      return renderMobileRows();
    }

    return <Table columns={columns[tabIndex] as any} data={data} />;
  };

  return (
    <BottomTablesSkeletonWrapper isReady={vm.initialized || !accountStore.isConnected}>
      <BaseTable activeTab={tabIndex} tabs={TABS} onTabClick={handleTab}>
        {renderTable()}
      </BaseTable>
      {data.length >= minNeedLengthPagination || page > startPage ? (
        <PaginationContainer>
          <Pagination currentPage={page} onChange={handleChangePagination} />
        </PaginationContainer>
      ) : null}
      {!!vm.myOrders.length && tabIndex === 0 && (
        //todo здесь была кнопка cancel all orders
        <TextGraph style={{ textAlign: "center" }}>Data provided by Envio</TextGraph>
      )}
    </BottomTablesSkeletonWrapper>
  );
});

export default SpotTableImpl;

export const TableText = styled(Text)`
  display: flex;
  align-items: center;
`;

const PaginationContainer = styled.div`
  background: ${({ theme }) => theme.colors.bgSecondary};
  height: 48px;
  display: flex;
  align-items: center;
  padding: 12px;
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

const TextGraph = styled(Text)`
  text-transform: uppercase;

  ${media.desktop} {
    display: none;
  }
`;