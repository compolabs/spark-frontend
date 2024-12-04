import React, { useState } from "react";
import styled from "@emotion/styled";
import { createColumnHelper } from "@tanstack/react-table";
import { observer } from "mobx-react";

import { BN } from "@compolabs/spark-orderbook-ts-sdk";

import Button from "@components/Button.tsx";
import Chip from "@components/Chip.tsx";
import { Column } from "@components/Flex.tsx";
import { AssetBlockData } from "@components/SelectAssets/SelectAssetsInput.tsx";
import { SmartFlex } from "@components/SmartFlex.tsx";
import Table from "@components/Table.tsx";
import Text, { TEXT_TYPES } from "@components/Text.tsx";

import { useMedia } from "@hooks/useMedia.ts";
import { useStores } from "@stores";
import { TRADE_TABLE_SIZE } from "@stores/SettingsStore.ts";

import { BaseTable } from "@screens/SpotScreen/BottomTables/BaseTable.tsx";

const orderColumnHelper = createColumnHelper<any>();

const AssetsDashboard = observer(() => {
  const [isLoading, setLoading] = useState(false);
  const media = useMedia();
  const { balanceStore } = useStores();
  const balancesInfoList = balanceStore.formattedBalanceInfoList;
  const data = balancesInfoList.map((el) => ({
    asset: el.asset,
    amount: el,
    value: new BN(el.balance).multipliedBy(el.price).toSignificant(el.asset.decimals),
    currentPrice: new BN(el.price).toSignificant(2),
  }));
  const allContractBalance = balancesInfoList.reduce((acc, el) => {
    return acc.plus(el.contractBalance);
  }, BN.ZERO);
  const columns = [
    orderColumnHelper.accessor("asset", {
      header: "Name",
      cell: (props) => {
        return (
          <TokenContainer gap="4px">
            <TokenIcon src={props.getValue().logo} />
            <Text primary>{props.getValue().name}</Text>
          </TokenContainer>
        );
      },
    }),
    orderColumnHelper.accessor("amount", {
      header: "Amount",
      cell: (props) => {
        const value = props.getValue();
        return (
          <ValueContainer>
            <Text primary>{new BN(value.balance).toSignificant(value.asset.decimals)}</Text>
            <SymbolContainer>{value.asset.symbol}</SymbolContainer>
          </ValueContainer>
        );
      },
    }),
    orderColumnHelper.accessor("value", {
      header: "Value",
      cell: (props) => {
        return (
          <ValueContainer>
            <Text primary>${new BN(props.getValue()).toSignificant(2)}</Text>
          </ValueContainer>
        );
      },
    }),
    orderColumnHelper.accessor("currentPrice", {
      header: "Current Price",
      cell: (props) => {
        return (
          <ValueContainer>
            <Text primary>${props.getValue()}</Text>
          </ValueContainer>
        );
      },
    }),
    orderColumnHelper.accessor("amount", {
      header: () => {
        return (
          allContractBalance.isGreaterThan(BN.ZERO) && (
            <ButtonConfirm
              disabled={isLoading}
              style={{
                minWidth: "92px",
              }}
              onClick={handleWithdrawAll}
            >
              {isLoading ? "Loading..." : "Withdraw All"}
            </ButtonConfirm>
          )
        );
      },
      id: "action",
      cell: (props) => {
        const value = props.getValue();
        return (
          <SmartFlex justifyContent="flex-end">
            {new BN(value.contractBalance).isGreaterThan(0) && (
              <WithdrawalButton
                data-order-id={value.assetId}
                style={{
                  minWidth: "92px",
                }}
                onClick={() => {
                  withdrawalBalance(value);
                }}
              >
                {isLoading ? "Loading..." : "Withdraw"}
              </WithdrawalButton>
            )}
          </SmartFlex>
        );
      },
    }),
  ];

  const renderTable = () => {
    return <Table columns={columns} data={data} />;
  };

  const renderMobileRows = () => {
    const orderData = data.map((ord, i) => (
      <MobileTableOrderRow key={i}>
        <MobileTableRowColumn>
          <TokenContainer gap="8px">
            <TokenIcon src={ord.asset.logo} />
            <Column>
              <Text primary>{ord.asset.name}</Text>
              <Text>${ord.currentPrice}</Text>
            </Column>
          </TokenContainer>
        </MobileTableRowColumn>
        <MobileTableRowColumn>
          <Column>
            <RightText primary>
              {ord.amount.balance} {ord.asset.symbol}
            </RightText>
            <RightText>${new BN(ord.amount.balance).multipliedBy(ord.amount.price).toSignificant(2)}</RightText>
          </Column>
        </MobileTableRowColumn>
      </MobileTableOrderRow>
    ));
    return (
      <SmartFlex gap="4px" padding="8px" width="100%" column>
        {orderData}
        {allContractBalance.isGreaterThan(BN.ZERO) && (
          <ButtonConfirm disabled={isLoading} fitContent onClick={handleWithdrawAll}>
            {isLoading ? "Loading..." : "Withdraw All"}
          </ButtonConfirm>
        )}
      </SmartFlex>
    );
  };

  const withdrawalBalance = async (selectAsset: AssetBlockData) => {
    setLoading(true);
    await balanceStore.withdrawBalance(
      selectAsset.asset.assetId,
      BN.parseUnits(selectAsset.contractBalance, selectAsset.asset.decimals).toString(),
    );
    setLoading(false);
  };

  const handleWithdrawAll = async () => {
    setLoading(true);
    await balanceStore.withdrawBalanceAll();
    setLoading(false);
  };

  return (
    <>
      <TitleText type={TEXT_TYPES.H} primary>
        Assets
      </TitleText>
      <StyledTables>
        {media.desktop ? (
          <BaseTable activeTab={0} size={TRADE_TABLE_SIZE.AUTO} onTabClick={() => {}}>
            {renderTable()}
          </BaseTable>
        ) : (
          renderMobileRows()
        )}
      </StyledTables>
    </>
  );
});

export default AssetsDashboard;

const TitleText = styled(Text)`
  padding-top: 32px;
  padding-bottom: 8px;
  height: 72px;
  display: flex;
  align-items: center;
`;

const TokenIcon = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

const TokenContainer = styled(SmartFlex)`
  align-items: center;
`;

const ValueContainer = styled(SmartFlex)`
  align-items: center;
  gap: 4px;
  width: 160px;
`;

const SymbolContainer = styled(SmartFlex)`
  background: #000000;
  padding: 4px;
  text-align: center;
  border-radius: 4px;
`;

const StyledTables = styled.div`
  width: 100%;
  border: 1px solid rgba(46, 46, 46, 1);
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 8px;
`;

const WithdrawalButton = styled(Chip)`
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary} !important;
`;

const MobileTableOrderRow = styled(SmartFlex)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  width: 100%;
  padding: 11px 7px 14px 7px;
  border: 1px solid rgba(46, 46, 46, 1);
  border-radius: 4px;
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

const RightText = styled(Text)`
  width: 100%;
  text-align: right;
`;

const ButtonConfirm = styled(Button)`
  width: 100%;
  min-width: 90px;
`;
