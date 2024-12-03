import React, { useState } from "react";
import styled from "@emotion/styled";
import { createColumnHelper } from "@tanstack/react-table";
import { observer } from "mobx-react";

import { BN } from "@compolabs/spark-orderbook-ts-sdk";

import Chip from "@components/Chip.tsx";
import { AssetBlockData } from "@components/SelectAssets/SelectAssetsInput.tsx";
import { SmartFlex } from "@components/SmartFlex.tsx";
import Table from "@components/Table.tsx";
import Text, { TEXT_TYPES } from "@components/Text.tsx";
import { media } from "@themes/breakpoints.ts";

import { useStores } from "@stores";
import { TRADE_TABLE_SIZE } from "@stores/SettingsStore.ts";

import { BaseTable } from "@screens/SpotScreen/BottomTables/BaseTable.tsx";

const orderColumnHelper = createColumnHelper<any>();

const AssetsDashboard = observer(() => {
  const [isLoading, setLoading] = useState(false);
  const { balanceStore } = useStores();
  const balancesInfoList = balanceStore.formattedBalanceInfoList;
  const data = balancesInfoList.map((el) => ({
    name: el.asset,
    amount: el,
    value: new BN(el.balance).multipliedBy(el.price).toSignificant(el.asset.decimals),
    currentPrice: new BN(el.price).toSignificant(2),
    asset: el,
  }));
  const columns = [
    orderColumnHelper.accessor("name", {
      header: "Name",
      cell: (props) => {
        return (
          <TokenContainer>
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
    orderColumnHelper.accessor("asset", {
      header: "",
      id: "action",
      cell: (props) => {
        const value = props.getValue();
        return (
          <SmartFlex justifyContent="flex-end">
            {value.contractBalance > 0 && (
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
    // if (!data.length) {
    //   return (
    //     <TableContainer center column>
    //       <Text type={TEXT_TYPES.H} primary>
    //         You haven&apos;t made any trades so far
    //       </Text>
    //       <Text type={TEXT_TYPES.BODY} secondary>
    //         Begin trading to view updates on your portfolio
    //       </Text>
    //     </TableContainer>
    //   );
    // }
    return <Table columns={columns} data={data} />;
  };

  const withdrawalBalance = async (selectAsset: AssetBlockData) => {
    setLoading(true);
    await balanceStore.withdrawBalance(
      selectAsset.asset.assetId,
      BN.parseUnits(
        BN.formatUnits(selectAsset.balance, selectAsset.asset.decimals),
        selectAsset.asset.decimals,
      ).toString(),
    );
    setLoading(false);
  };

  return (
    <>
      <TitleText type={TEXT_TYPES.H} primary>
        Assets
      </TitleText>
      <StyledTables>
        <BaseTable activeTab={0} size={TRADE_TABLE_SIZE.AUTO} onTabClick={() => {}}>
          {renderTable()}
        </BaseTable>
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
  gap: 4px;
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
  border-radius: 8px;

  ${media.mobile} {
    flex-grow: 1;
  }
`;

const WithdrawalButton = styled(Chip)`
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary} !important;
`;
