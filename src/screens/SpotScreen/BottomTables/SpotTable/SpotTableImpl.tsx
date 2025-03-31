import React, { useEffect, useState } from "react";
import { Theme, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { createColumnHelper } from "@tanstack/react-table";
import { observer } from "mobx-react";

import Button from "@components/Button";
import Chip from "@components/Chip";
import { Column } from "@components/Flex";
import { Pagination } from "@components/Pagination/Pagination";
import { AssetBlockData } from "@components/SelectAssets/SelectAssetsInput";
import BottomTablesSkeletonWrapper from "@components/Skeletons/BottomTablesSkeletonWrapper";
import { SmartFlex } from "@components/SmartFlex";
import Table from "@components/Table";
import Text from "@components/Text";
import { media } from "@themes/breakpoints";

import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";

import { toCurrency } from "@utils/toCurrency";

import { BN } from "@blockchain/fuel/types";
import { SpotMarketOrder } from "@entity";

import { BaseTable } from "../BaseTable";

import { useSpotTableVMProvider } from "./SpotTableVM";

const orderColumnHelper = createColumnHelper<SpotMarketOrder>();
const tradeColumnHelper = createColumnHelper<SpotMarketOrder>();
const balanceColumnHelper = createColumnHelper<AssetBlockData>();

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
    cell: (props) => toCurrency(props.getValue(), props.row.original.quoteToken.symbol),
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
  tradeColumnHelper.accessor("formatAvgPrice", {
    header: "Price",
    cell: (props) => toCurrency(props.getValue(), props.row.original.quoteToken.symbol),
  }),
];

const BALANCE_COLUMNS = (
  theme: Theme,
  withdrawalBalance: (asset: AssetBlockData) => void,
  isLoading: string | null,
) => [
  balanceColumnHelper.accessor("asset", {
    header: "Token",
    cell: (props) => {
      return (
        <IconContainer gap="4px">
          <TokenIcon src={props.getValue().logo} />
          <Text primary>{props.getValue().name}</Text>
        </IconContainer>
      );
    },
  }),
  balanceColumnHelper.accessor("walletBalance", {
    header: "Wallet",
    cell: (props) => {
      return (
        <IconContainer gap="4px">
          <Text primary>{props.getValue().toString()}</Text>
        </IconContainer>
      );
    },
  }),
  balanceColumnHelper.accessor("orderBalance", {
    header: "Open orders",
    cell: (props) => {
      return (
        <IconContainer gap="4px">
          <Text primary>{props.getValue().toString()}</Text>
        </IconContainer>
      );
    },
  }),
  balanceColumnHelper.accessor("contractBalance", {
    header: "Withdrawable",
    cell: (props) => {
      return (
        <IconContainer gap="4px">
          <Text primary>{props.getValue().toString()}</Text>
        </IconContainer>
      );
    },
  }),
  balanceColumnHelper.accessor("balance", {
    header: "Total amount",
    cell: (props) => {
      return (
        <IconContainer gap="4px">
          <Text primary>{props.getValue().toString()}</Text>
        </IconContainer>
      );
    },
  }),
  balanceColumnHelper.accessor("contractBalance", {
    header: () => {
      return;
    },
    id: "action",
    cell: (props) => {
      const value = props.getValue();
      const isDisable = !new BN(value).isGreaterThan(0);
      return (
        <SmartFlex justifyContent="flex-end">
          <WithdrawalButton
            data-order-id={props.row.original.assetId}
            disabled={isDisable}
            fitContent
            onClick={() => {
              withdrawalBalance(props.row.original);
            }}
          >
            {!!isLoading && isLoading === props.row.original.assetId ? "Loading..." : "Withdraw"}
          </WithdrawalButton>
        </SmartFlex>
      );
    },
  }),
];

const minNeedLengthPagination = 10;
const startPage = 1;
// todo: Упростить логику разделить формирование данных и рендер для декстопа и мобилок
export interface SpotTableImplProps {
  isShowBalance?: boolean;
}
const SpotTableImpl: React.FC<SpotTableImplProps> = observer(({ isShowBalance = true }) => {
  const { accountStore, settingsStore, balanceStore } = useStores();
  const [isLoading, setLoading] = useState<string | null>(null);
  const vm = useSpotTableVMProvider();
  const theme = useTheme();
  const media = useMedia();
  const [tabIndex, setTabIndex] = useState(0);
  const withdrawalBalance = async (selectAsset: AssetBlockData) => {
    if (isLoading) return;
    setLoading(selectAsset.assetId);
    await balanceStore.withdrawBalance(
      selectAsset.asset.assetId,
      BN.parseUnits(selectAsset.contractBalance, selectAsset.asset.decimals).toString(),
    );
    setLoading(null);
  };
  const columns = [
    ORDER_COLUMNS(vm, theme),
    HISTORY_COLUMNS(theme),
    BALANCE_COLUMNS(theme, withdrawalBalance, isLoading),
  ];
  const [page, setPage] = useState(startPage);
  const historyOrdersCount = (vm.userOrdersStats?.closed ?? 0) + (vm.userOrdersStats?.canceled ?? 0);
  const openOrdersCount = vm.userOrdersStats?.active ?? 0;
  const PAGINATION_LENGTH = [openOrdersCount, historyOrdersCount];
  const balancesInfoList = balanceStore.formattedBalanceInfoList.filter((item) =>
    new BN(item.balance).isGreaterThan(BN.ZERO),
  );

  const TABS = [
    { title: "ORDERS", disabled: false, rowCount: openOrdersCount },
    { title: "HISTORY", disabled: false, rowCount: historyOrdersCount },
    ...(isShowBalance ? [{ title: "BALANCES", disabled: false, rowCount: balancesInfoList.length }] : []),
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
          <Text color={theme.colors.textPrimary} type="BUTTON_SECONDARY">
            {ord.marketSymbol}
          </Text>
          <SmartFlex gap="2px" column>
            <Text type="SUPPORTING">Amount</Text>
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
              <Text type="SUPPORTING">Side:</Text>
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
            <Text type="SUPPORTING">Price:</Text>
            <Text color={theme.colors.textPrimary}>{toCurrency(ord.formatPrice, ord.quoteToken.symbol)}</Text>
          </SmartFlex>
        </MobileTableRowColumn>
      </MobileTableOrderRow>
    ));

    const orderHistoryData = vm.userOrdersHistory.map((ord, i) => (
      <MobileTableOrderRow key={i + "mobile-history-row"}>
        <MobileTableRowColumn>
          <Text color={theme.colors.textPrimary} type="BUTTON_SECONDARY">
            {ord.marketSymbol}
          </Text>
          <SmartFlex gap="2px" column>
            <Text type="SUPPORTING">Amount</Text>
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
              <Text type="SUPPORTING">Side:</Text>
              <TableText color={ord.orderType === "Sell" ? theme.colors.redLight : theme.colors.greenLight}>
                {ord.orderType}
              </TableText>
            </SmartFlex>
            <SmartFlex center="y" gap="4px">
              <Text type="SUPPORTING">Filled:</Text>
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
            <Text type="SUPPORTING">Price:</Text>
            <Text color={theme.colors.textPrimary}>{toCurrency(ord.formatPrice, ord.quoteToken.symbol)}</Text>
          </SmartFlex>
        </MobileTableRowColumn>
      </MobileTableOrderRow>
    ));

    const updatedBalancesData = balancesInfoList.map((el) => (
      <BalanceContainer key={el.asset.assetId}>
        <BalanceHeader>
          <IconContainer gap="4px">
            <TokenIcon src={el.asset.logo} />
            <Text primary>{el.asset.name}</Text>
          </IconContainer>
          <WithdrawalButton
            data-order-id={el.assetId}
            disabled={!new BN(el.contractBalance).isGreaterThan(0)}
            fitContent
            onClick={() => {
              withdrawalBalance(el);
            }}
          >
            {!!isLoading && isLoading === el.assetId ? "Loading..." : "Withdraw"}
          </WithdrawalButton>
        </BalanceHeader>
        <BalanceRow>
          <BalanceColumn>
            <Text>Wallet</Text>
            <Text primary>{el.balance.toString()}</Text>
          </BalanceColumn>
          <BalanceColumn>
            <Text>Open orders</Text>
            <Text primary>{el.orderBalance.toString()}</Text>
          </BalanceColumn>
        </BalanceRow>
        <BalanceRow>
          <BalanceColumn>
            <Text>Withdrawable</Text>
            <Text primary>{el.contractBalance.toString()}</Text>
          </BalanceColumn>
          <BalanceColumn>
            <Text>Total amount</Text>
            <Text primary>{el.balance.toString()}</Text>
          </BalanceColumn>
        </BalanceRow>
      </BalanceContainer>
    ));
    const tabToData = [orderData, orderHistoryData, updatedBalancesData];

    return (
      <SmartFlex width="100%" column>
        {tabToData[tabIndex]}
      </SmartFlex>
    );
  };

  const tabToData = [vm.userOrders, vm.userOrdersHistory, balancesInfoList];
  const data = tabToData[tabIndex];
  const handleChangePagination = (e: number) => {
    vm.setOffset(e);
    setPage(e);
  };

  const renderTable = () => {
    if (!accountStore.isConnected) {
      return (
        <TableContainer center column>
          <Text type="H" primary>
            Connect your wallet to see your open orders
          </Text>
        </TableContainer>
      );
    }

    if (!data.length && tabIndex !== 3) {
      return (
        <TableContainer center column>
          <Text type="H" primary>
            You have no open orders
          </Text>
          <Text type="BODY" secondary>
            Begin trading to view updates on your portfolio
          </Text>
        </TableContainer>
      );
    } else if (!data.length && tabIndex === 3) {
      return (
        <TableContainer center column>
          <Text type="H" primary>
            You have no balance
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
        <Pagination currentPage={page} lengthData={PAGINATION_LENGTH[tabIndex]} onChange={handleChangePagination} />
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

const TokenIcon = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

const IconContainer = styled(SmartFlex)`
  align-items: center;
`;

const WithdrawalButton = styled(Button)`
  cursor: pointer;
  border-radius: 5px;
  min-width: 92px;
  height: 20px !important;
  font-size: 12px;
  padding: 0 4px !important;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary} !important;
`;

const BalanceContainer = styled(SmartFlex)`
  flex-direction: column;
  padding: 12px;
`;

const BalanceHeader = styled(SmartFlex)`
  width: 100%;
  justify-content: space-between;
  padding: 0px 0px 12px 0px;
`;

const BalanceRow = styled(SmartFlex)`
  width: 100%;
  padding: 4px 12px 12px 0px;

  &:last-child {
    border-bottom: 1px solid #9696963d;
  }
`;

const BalanceColumn = styled(Column)`
  width: 160px;
`;
