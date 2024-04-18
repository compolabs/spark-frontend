import React, { useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Chip from "@components/Chip";
import Text, { TEXT_TYPES } from "@components/Text";
import { SmartFlex } from "@src/components/SmartFlex";
import Table from "@src/components/Table";
import TOKEN_LOGOS from "@src/constants/tokenLogos";
import useFlag from "@src/hooks/useFlag";
import { useMedia } from "@src/hooks/useMedia";
import { MODAL_TYPE } from "@src/stores/ModalStore";
import { media } from "@src/themes/breakpoints";
import BN from "@src/utils/BN";
import { useStores } from "@stores";

import { BaseTable } from "../BaseTable";

import TakeProfitStopLossSheet from "./TakeProfitStopLoss/TakeProfitStopLossSheet";
import { BALANCE_COLUMNS, ORDER_COLUMNS, POSITIONS_COLUMNS } from "./helpers";
import { usePerpTableVMProvider } from "./PerpTableVM";

// todo: Упростить логику разделить формирование данных и рендер для декстопа и мобилок
const PerpTableImpl: React.FC = observer(() => {
  const { faucetStore, blockchainStore, collateralStore, modalStore } = useStores();
  const bcNetwork = blockchainStore.currentInstance;

  const vm = usePerpTableVMProvider();
  const theme = useTheme();
  const media = useMedia();

  const [isTpSlSheetOpen, openTpSlSheet, closeTpSlSheet] = useFlag();
  const [isTpSlTooltipOpen, setIsTpSlTooltipOpen] = useState(false);

  const [tabIndex, setTabIndex] = useState(0);
  const columns = [
    POSITIONS_COLUMNS({
      vm,
      theme,
      isTooltipVisible: isTpSlTooltipOpen,
      onTooltipVisibleChange: setIsTpSlTooltipOpen,
    }),
    ORDER_COLUMNS({ vm, theme }),
    BALANCE_COLUMNS({ openDepositModal: () => modalStore.open(MODAL_TYPE.DEPOSIT_WITHDRAW_MODAL) }),
  ];

  const [isTpSlActive, setTpSlActive] = useState(false);

  const balanceData = Array.from(collateralStore.balances)
    .filter(([, balance]) => balance && balance.gt(0))
    .map(([assetId, balance]) => {
      const token = bcNetwork!.getTokenByAssetId(assetId);
      return {
        asset: token,
        balance: BN.formatUnits(balance, token.decimals).toSignificant(2),
        assetId,
      };
    });

  const tabs = [
    { title: "POSITIONS", disabled: false, rowCount: vm.myPositions.length },
    { title: "ORDERS", disabled: false, rowCount: vm.myOrders.length },
    { title: "BALANCES", disabled: false, rowCount: balanceData.length },
    // { title: "TRADES", disabled: true },
    // { title: "UNSETTLED P&L", disabled: true },
    // { title: "HISTORY", disabled: true },
  ];

  const handleTpSlChange = () => {
    setTpSlActive((state) => !state);
  };

  const renderMobileRows = () => {
    const positionData = vm.myPositions.map((pos, i) => {
      const positionColor = pos.type === "Long" ? theme.colors.greenLight : theme.colors.redLight;
      return (
        <MobileTablePositionRow key={i + "mobile-row"}>
          <SmartFlex gap="1px" column>
            <SmartFlex center="y" gap="8px">
              <SmartFlex center="y" gap="4px">
                <TokenIcon alt={pos.symbol} src={TOKEN_LOGOS[pos.baseToken.symbol]} />
                <Text primary>{pos.symbol}</Text>
              </SmartFlex>
              <Text color={positionColor}>{pos.type}</Text>
            </SmartFlex>
            <SmartFlex center="y" gap="4px">
              <Text>Size:</Text>
              <Text primary>{pos.takerPositionSize.toSignificant(2)}</Text>
              <TokenBadge>
                <Text>{pos.baseToken.symbol}</Text>
              </TokenBadge>
            </SmartFlex>
            <SmartFlex center="y" gap="4px">
              <Text>Value:</Text>
              <Text primary>{pos.entrySizeValue.toSignificant(2)}</Text>
            </SmartFlex>
            <SmartFlex center="y" gap="4px">
              <Text>Margin:</Text>
              <Text primary>{pos.margin.toSignificant(2)}</Text>
              <TokenBadge>
                <Text>{pos.quoteToken.symbol}</Text>
              </TokenBadge>
            </SmartFlex>
            <SmartFlex column>
              <Text>Unrealized PNL:</Text>
              <SmartFlex center="y" gap="4px">
                <Text primary>{pos.unrealizedPnl.toSignificant(2)}</Text>
                <TokenBadge>
                  <Text>{pos.quoteToken.symbol}</Text>
                </TokenBadge>
                <Text primary>{pos.unrealizedPnlPercent.toSignificant(2)}%</Text>
              </SmartFlex>
            </SmartFlex>
          </SmartFlex>
          <SmartFlex gap="2px" margin="0 0 0 8px" column>
            {/* <SmartFlex center="y" gap="4px">
              <CancelButton onClick={() => vm.cancelOrder("")}>Close</CancelButton>
              <CancelButton onClick={openTpSlSheet}>TP/SL</CancelButton>
            </SmartFlex> */}
            <SmartFlex center="y" gap="4px">
              <Text>Entry Price:</Text>
              <Text primary>{pos.entryPrice.toSignificant(2)}</Text>
            </SmartFlex>
            <SmartFlex center="y" gap="4px">
              <Text>Mark Price:</Text>
              <Text primary>{pos.markPrice.toSignificant(2)}</Text>
            </SmartFlex>
            <SmartFlex column>
              <Text>Funding payment:</Text>
              <SmartFlex center="y" gap="4px">
                <Text primary>{pos.pendingFundingPayment.toSignificant(2)}</Text>
                <TokenBadge>
                  <Text>{pos.quoteToken.symbol}</Text>
                </TokenBadge>
              </SmartFlex>
            </SmartFlex>
          </SmartFlex>
        </MobileTablePositionRow>
      );
    });

    const orderData = vm.myOrders.map((ord, i) => (
      <MobileTablePositionRow key={i + "mobile-row"}>
        <SmartFlex gap="1px" column>
          <SmartFlex center="y" gap="4px">
            <TokenIcon alt={ord.symbol} src={TOKEN_LOGOS[ord.baseToken.symbol]} />
            <Text primary>{ord.symbol}</Text>
          </SmartFlex>
          <SmartFlex center="y" gap="4px">
            <Text>Size:</Text>
            <Text primary>{ord.baseSizeFormatted}</Text>
            <TokenBadge>
              <Text>{ord.baseToken.symbol}</Text>
            </TokenBadge>
          </SmartFlex>
          <SmartFlex center="y" gap="4px">
            <Text>Value:</Text>
            <Text primary>{ord.baseSizeValueFormatted}</Text>
          </SmartFlex>
        </SmartFlex>
        <SmartFlex alignItems="flex-end" gap="2px" margin="0 0 0 8px" column>
          <SmartFlex center="y">
            <CancelButton onClick={() => vm.cancelOrder(ord.id)}>Close</CancelButton>
          </SmartFlex>
          <SmartFlex center="y" gap="4px">
            <Text>Entry Price:</Text>
            <Text primary>{ord.orderPriceFormatted}</Text>
          </SmartFlex>
        </SmartFlex>
      </MobileTablePositionRow>
    ));

    const balanceData = Array.from(collateralStore.balances)
      .filter(([, balance]) => balance && balance.gt(0))
      .map(([assetId, balance], i) => {
        const token = bcNetwork!.getTokenByAssetId(assetId);
        return (
          <MobileTableOrderRow key={i + "mobile-row"}>
            <MobileTableRowColumn>
              <Text type={TEXT_TYPES.SUPPORTING}>Token</Text>
              <SmartFlex center="y" gap="4px">
                <TokenIcon alt="market-icon" src={token.logo} />
                <Text type={TEXT_TYPES.BUTTON_SECONDARY} primary>
                  {token.symbol}
                </Text>
              </SmartFlex>
            </MobileTableRowColumn>
            <MobileTableRowColumn>
              <Text type={TEXT_TYPES.SUPPORTING}>Balance</Text>
              <Text primary>{BN.formatUnits(balance, token.decimals).toSignificant(2)}</Text>
            </MobileTableRowColumn>
            <MobileTableRowColumn>
              <CancelButton onClick={() => faucetStore.mintByAssetId(assetId)}>
                {faucetStore.loading && faucetStore.actionTokenAssetId === assetId ? "Loading..." : "Mint"}
              </CancelButton>
            </MobileTableRowColumn>
          </MobileTableOrderRow>
        );
      });

    const tabToData = [positionData, orderData, balanceData];

    return (
      <SmartFlex width="100%" column>
        {tabToData[tabIndex]}
      </SmartFlex>
    );
  };

  const tabToData = [vm.myPositions, vm.myOrders, balanceData];
  const data = tabToData[tabIndex];

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
    <>
      <BaseTable activeTab={tabIndex} tabs={tabs} onTabClick={setTabIndex}>
        {renderTable()}
      </BaseTable>
      {!!vm.myPositions.length && tabIndex === 0 && (
        <TextGraph style={{ textAlign: "center" }}>Data provided by Envio</TextGraph>
      )}

      <TakeProfitStopLossSheet
        isOpen={isTpSlSheetOpen}
        isTpSlActive={isTpSlActive}
        onClose={closeTpSlSheet}
        onToggleTpSl={handleTpSlChange}
      />
    </>
  );
});

export default PerpTableImpl;

const CancelButton = styled(Chip)`
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary} !important;
`;

const TokenIcon = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 50%;
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

const MobileTablePositionRow = styled(SmartFlex)`
  display: grid;
  grid-template-columns: 1fr max-content;
  width: 100%;
  padding: 11px 7px 14px 7px;
  background: ${({ theme }) => theme.colors.bgPrimary};

  position: relative;

  ${SmartFlex}:last-of-type {
    margin-right: 8px;
  }

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
