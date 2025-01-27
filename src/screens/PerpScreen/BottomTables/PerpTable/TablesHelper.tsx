import React from "react";
import { Theme } from "@emotion/react";
import styled from "@emotion/styled";
import { createColumnHelper } from "@tanstack/react-table";

import { BN } from "@compolabs/spark-orderbook-ts-sdk";

import Chip from "@src/components/Chip";
import { SmartFlex } from "@src/components/SmartFlex";
import Text from "@src/components/Text";
import TOKEN_LOGOS from "@src/constants/tokenLogos";
import { PerpOrder, PerpPosition, Token } from "@src/entity";

interface BalanceColumnParams {
  openDepositModal: () => void;
}

const positionColumnHelper = createColumnHelper<PerpPosition>();
const orderColumnHelper = createColumnHelper<PerpOrder>();
const balanceColumnHelper = createColumnHelper<{ asset: Token; balance: string; assetId: string }>();

export const POSITIONS_COLUMNS = (theme: Theme) => {
  return [
    positionColumnHelper.accessor("baseToken", {
      header: "Trading Pair",
      cell: (props) => {
        const color = props.row.original.type === "Long" ? theme.colors.greenLight : theme.colors.redLight;
        console.log("props.getValue()", props.getValue());
        return (
          <SmartFlex alignItems="center" gap="10px">
            <TokenIcon
              alt={props.row.original.symbol}
              height={20}
              src={TOKEN_LOGOS[props.getValue().symbol]}
              width={20}
            />
            <SmartFlex column>
              <Text>{props.row.original.symbol}</Text>
              <Text color={color}>
                {props.row.original.leverage}X {props.row.original.type}
              </Text>
            </SmartFlex>
          </SmartFlex>
        );
      },
    }),
    // positionColumnHelper.accessor("takerPositionSize", {
    //   header: "Size / Value",
    //   cell: (props) => (
    //     <SmartFlex column>
    //       <SmartFlex center="y" gap="4px">
    //         <Text primary>{props.getValue().toFixed(2)}</Text>
    //         <TokenBadge>
    //           <Text>{props.row.original.baseToken.symbol}</Text>
    //         </TokenBadge>
    //       </SmartFlex>
    //       <Text primary>{props.row.original.entrySizeValue.toSignificant(2)}</Text>
    //     </SmartFlex>
    //   ),
    // }),
    // positionColumnHelper.accessor("margin", {
    //   header: "Margin",
    //   cell: (props) => (
    //     <SmartFlex alignSelf="flex-start" center="y" gap="4px" height="100%">
    //       <Text primary>{props.getValue().toSignificant(2)}</Text>
    //       <TokenBadge>
    //         <Text>{props.row.original.quoteToken.symbol}</Text>
    //       </TokenBadge>
    //     </SmartFlex>
    //   ),
    // }),
    // positionColumnHelper.accessor("entryPrice", {
    //   header: "Entry / Mark",
    //   cell: (props) => (
    //     <SmartFlex center="y" gap="2px" column>
    //       <Text primary>{props.getValue().toSignificant(2)}</Text>
    //       <Text primary>{props.row.original.markPrice.toSignificant(2)}</Text>
    //     </SmartFlex>
    //   ),
    // }),
    // positionColumnHelper.accessor("unrealizedPnl", {
    //   header: "Unrealized PNL",
    //   cell: (props) => {
    //     const color = props.row.original.isUnrealizedPnlInProfit ? theme.colors.greenLight : theme.colors.redLight;
    //     return (
    //       <SmartFlex column>
    //         <SmartFlex center="y" gap="4px">
    //           <Text color={color} primary>
    //             {props.getValue().toSignificant(2)}
    //           </Text>
    //           <TokenBadge>
    //             <Text>{props.row.original.quoteToken.symbol}</Text>
    //           </TokenBadge>
    //         </SmartFlex>
    //         <Text color={color}>{props.row.original.unrealizedPnlPercent.toSignificant(2)}%</Text>
    //       </SmartFlex>
    //     );
    //   },
    // }),
    // positionColumnHelper.accessor("pendingFundingPayment", {
    //   header: "Funding payment",
    //   cell: (props) => (
    //     <SmartFlex center="y" gap="4px">
    //       <Text color={theme.colors.greenLight} primary>
    //         {props.getValue().toSignificant(2)}
    //       </Text>
    //       <TokenBadge>
    //         <Text>{props.row.original.quoteToken.symbol}</Text>
    //       </TokenBadge>
    //     </SmartFlex>
    //   ),
    // }),
    // positionColumnHelper.accessor("id", {
    //   header: "",
    //   cell: (props) => (
    //     <SmartFlex center="y" gap="4px">
    //       <CancelButton onClick={() => params.vm.cancelOrder(props.getValue())}>
    //         {params.vm.cancelingOrderId === props.getValue() ? "Loading..." : "Close"}
    //       </CancelButton>
    //       <CancelButton onClick={() => params.onTooltipVisibleChange(true)}>
    //         <TakeProfitStopLossTooltip
    //           isVisible={params.isTooltipVisible}
    //           onVisibleChange={params.onTooltipVisibleChange}
    //         />
    //       </CancelButton>
    //     </SmartFlex>
    //   ),
    // }),
  ];
};

export const ORDER_COLUMNS = () => [
  orderColumnHelper.accessor("baseToken", {
    header: "Trading Pair",
    cell: (props) => (
      <SmartFlex center="y" gap="4px">
        <TokenIcon alt={props.row.original.symbol} height={16} src={TOKEN_LOGOS[props.getValue().symbol]} width={16} />
        <Text>
          {props.row.original.baseToken.symbol}/{props.row.original.quoteToken?.symbol}
        </Text>
      </SmartFlex>
    ),
  }),
  orderColumnHelper.accessor("baseSize", {
    header: "Size / Value",
    cell: (props) => (
      <SmartFlex column>
        <SmartFlex center="y" gap="4px">
          <Text primary>{new BN(props.row.original.baseSize).toString()}</Text>
          <TokenBadge>
            <Text>{props.row.original.baseToken.symbol}</Text>
          </TokenBadge>
          /{" "}
          <Text primary>
            {BN.formatUnits(
              new BN(props.row.original.baseSize.multipliedBy(props.row.original?.price ?? 0)),
              props.row.original.quoteToken?.decimals,
            ).toString()}
          </Text>
          <TokenBadge>
            <Text>{props.row.original.quoteToken?.symbol}</Text>
          </TokenBadge>
        </SmartFlex>
        <Text primary>{props.row.original.baseSizeValueFormatted}</Text>
      </SmartFlex>
    ),
  }),
  orderColumnHelper.accessor("price", {
    header: "Price",
    cell: (props) => (
      <SmartFlex center="y" column>
        <Text primary>
          {BN.formatUnits(props.row.original.price ?? 0, props.row.original.quoteToken?.decimals).toString()}
        </Text>
      </SmartFlex>
    ),
  }),
  orderColumnHelper.accessor("id", {
    header: "",
    cell: () => <CancelButton onClick={() => {}}>Cancel</CancelButton>,
  }),
];

export const BALANCE_COLUMNS = (params: BalanceColumnParams) => [
  balanceColumnHelper.accessor("asset", {
    header: "Asset",
    cell: (props) => {
      return (
        <SmartFlex center="y" gap="4px">
          <TokenIcon alt="market-icon" src={props.getValue().logo} />
          {props.getValue().symbol}
        </SmartFlex>
      );
    },
  }),
  balanceColumnHelper.accessor("balance", {
    header: "Balance",
  }),
  balanceColumnHelper.accessor("assetId", {
    header: "",
    cell: () => (
      <SmartFlex center>
        <CancelButton onClick={params.openDepositModal}>Deposit</CancelButton>
      </SmartFlex>
    ),
  }),
];

const CancelButton = styled(Chip)`
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary} !important;
`;

const TokenIcon = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 50%;
`;

const TokenBadge = styled(SmartFlex)`
  padding: 4px 0px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 4px;

  ${Text} {
    line-height: 10px;
  }
`;
