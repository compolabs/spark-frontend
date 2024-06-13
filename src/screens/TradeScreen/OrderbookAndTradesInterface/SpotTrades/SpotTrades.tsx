import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import Text, { TEXT_TYPES } from "@components/Text";
import {
  SpotTradesVMProvider,
  useSpotTradesVM,
} from "@screens/TradeScreen/OrderbookAndTradesInterface/SpotTrades/SpotTradesVM";
import { SmartFlex } from "@src/components/SmartFlex";

const SpotTradesImpl: React.FC = observer(() => {
  const vm = useSpotTradesVM();
  const theme = useTheme();

  if (vm.trades.length === 0)
    return (
      <Root alignItems="center" justifyContent="center" mainAxisSize="stretch">
        <Text type={TEXT_TYPES.SUPPORTING}>No trades yet</Text>
      </Root>
    );

  return (
    <Root>
      <Header>
        {/*todo добавить описание из tradeStore в каком токене столбец (например Price USDC | Qty BTC)*/}
        <Text type={TEXT_TYPES.SUPPORTING}>Price</Text>
        <Text type={TEXT_TYPES.SUPPORTING}>Qty</Text>
        <Text type={TEXT_TYPES.SUPPORTING}>Time</Text>
      </Header>

      <Container className="better-scroll">
        {vm.trades.map((trade) => (
          <Row key={"trade" + trade.id} alignItems="center" justifyContent="space-between" style={{ marginBottom: 2 }}>
            <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
              {trade.formatPrice}
            </Text>
            <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
              {trade.formatTradeAmount}
            </Text>
            <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
              {trade.timestamp.format("HH:mm:ss")}
            </Text>
          </Row>
        ))}
      </Container>
    </Root>
  );
});

const SpotTrades = () => (
  <SpotTradesVMProvider>
    <SpotTradesImpl />
  </SpotTradesVMProvider>
);

export default SpotTrades;

const Root = styled(Column)`
  width: 100%;
  height: 100%;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  padding: 0 12px;
  text-align: center;
  height: 26px;
  align-items: center;
  margin: 8px 0;
  ${Text}:last-of-type {
    text-align: end;
  }
`;

const Container = styled.div`
  display: grid;
  width: 100%;
  box-sizing: border-box;
  padding: 5px 12px 0;
  overflow-y: auto;
  max-height: calc(100vh - 260px);
  gap: 2px;
`;

const Row = styled(SmartFlex)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  ${Text}:last-of-type {
    text-align: end;
  }
`;
