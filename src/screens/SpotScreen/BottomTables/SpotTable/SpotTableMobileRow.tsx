import React from "react";
import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";

import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";

import { useStores } from "@stores";

import { toCurrency } from "@utils/toCurrency";

import { SpotMarketOrder } from "@entity";

import { CancelButton, MobileTableOrderRow, MobileTableRowColumn, TableText, TokenBadge } from "./styles";

export enum TABLE_TYPE {
  ORDER_DATA,
  HISTORY,
}

interface Props {
  type: TABLE_TYPE;
  data: SpotMarketOrder[];
}

const OrderDataRow: React.FC<any> = observer(({ order }) => {
  const { spotTableStore } = useStores();
  const theme = useTheme();

  return (
    <MobileTableOrderRow>
      <MobileTableRowColumn>
        <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON_SECONDARY}>
          {order.marketSymbol}
        </Text>
        <SmartFlex gap="2px" column>
          <Text type={TEXT_TYPES.SUPPORTING}>Amount</Text>
          <SmartFlex center="y" gap="4px">
            <Text color={theme.colors.textPrimary}>{order.formatInitialAmount}</Text>
            <TokenBadge>
              <Text>{order.baseToken.symbol}</Text>
            </TokenBadge>
          </SmartFlex>
        </SmartFlex>
      </MobileTableRowColumn>
      <MobileTableRowColumn>
        <Text color={theme.colors.textPrimary}>Active</Text>
        <SmartFlex gap="2px" column>
          <SmartFlex center="y" gap="4px">
            <Text type={TEXT_TYPES.SUPPORTING}>Side:</Text>
            <TableText color={order.orderType === "Sell" ? theme.colors.redLight : theme.colors.greenLight}>
              {order.orderType}
            </TableText>
          </SmartFlex>
        </SmartFlex>
      </MobileTableRowColumn>
      <MobileTableRowColumn>
        <CancelButton onClick={() => spotTableStore.cancelOrder(order)}>
          {order.cancelingOrderId === order.id ? "Loading..." : "Cancel"}
        </CancelButton>
        <SmartFlex alignItems="flex-end" gap="2px" column>
          <Text type={TEXT_TYPES.SUPPORTING}>Price:</Text>
          <Text color={theme.colors.textPrimary}>{toCurrency(order.formatPrice)}</Text>
        </SmartFlex>
      </MobileTableRowColumn>
    </MobileTableOrderRow>
  );
});

const HistoryRow: React.FC<any> = observer(({ order }) => {
  const theme = useTheme();

  return (
    <MobileTableOrderRow>
      <MobileTableRowColumn>
        <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON_SECONDARY}>
          {order.marketSymbol}
        </Text>
        <SmartFlex gap="2px" column>
          <Text type={TEXT_TYPES.SUPPORTING}>Amount</Text>
          <SmartFlex center="y" gap="4px">
            <Text color={theme.colors.textPrimary}>{order.formatInitialAmount}</Text>
            <TokenBadge>
              <Text>{order.baseToken.symbol}</Text>
            </TokenBadge>
          </SmartFlex>
        </SmartFlex>
      </MobileTableRowColumn>
      <MobileTableRowColumn>
        <Text color={theme.colors.textPrimary}>Complete</Text>
        <SmartFlex gap="2px" column>
          <SmartFlex center="y" gap="4px">
            <Text type={TEXT_TYPES.SUPPORTING}>Side:</Text>
            <TableText color={order.orderType === "Sell" ? theme.colors.redLight : theme.colors.greenLight}>
              {order.orderType}
            </TableText>
          </SmartFlex>
          <SmartFlex center="y" gap="4px">
            <Text type={TEXT_TYPES.SUPPORTING}>Filled:</Text>
            <SmartFlex center="y" gap="4px">
              <Text color={theme.colors.textPrimary}>{order.formatCurrentAmount}</Text>
              <TokenBadge>
                <Text>{order.baseToken.symbol}</Text>
              </TokenBadge>
            </SmartFlex>
          </SmartFlex>
        </SmartFlex>
      </MobileTableRowColumn>
      <MobileTableRowColumn>
        <SmartFlex alignItems="flex-end" gap="2px" column>
          <Text type={TEXT_TYPES.SUPPORTING}>Price:</Text>
          <Text color={theme.colors.textPrimary}>{toCurrency(order.formatPrice)}</Text>
        </SmartFlex>
      </MobileTableRowColumn>
    </MobileTableOrderRow>
  );
});

const ROW_TYPE_MAP = {
  [TABLE_TYPE.ORDER_DATA]: OrderDataRow,
  [TABLE_TYPE.HISTORY]: HistoryRow,
};

export const MobileTableRows: React.FC<Props> = ({ data, type }) => {
  const Row = ROW_TYPE_MAP[type];
  const renderRows = data.map((order, i) => <Row key={i} order={order} />);

  return (
    <SmartFlex width="100%" column>
      {renderRows}
    </SmartFlex>
  );
};
