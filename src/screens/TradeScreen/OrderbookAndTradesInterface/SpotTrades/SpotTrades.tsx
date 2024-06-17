import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import Text, { TEXT_TYPES } from "@components/Text";
import { useSpotTradesVM } from "@screens/TradeScreen/OrderbookAndTradesInterface/SpotTrades/SpotTradesVM";
import Loader from "@src/components/Loader";
import { SmartFlex } from "@src/components/SmartFlex";

export const SpotTrades: React.FC = observer(() => {
  const vm = useSpotTradesVM();
  const theme = useTheme();

  const isOrderBookEmpty = vm.trades.length === 0;

  if (vm.isTradesLoading && isOrderBookEmpty) {
    return <Loader size={32} hideText />;
  }

  if (isOrderBookEmpty)
    return (
      <Root alignItems="center" justifyContent="center" mainAxisSize="stretch">
        <Text type={TEXT_TYPES.SUPPORTING}>No trades yet</Text>
      </Root>
    );

  return (
    <Root>
      <Header>
        <Text type={TEXT_TYPES.SUPPORTING}>Price</Text>
        <Text type={TEXT_TYPES.SUPPORTING}>Qty</Text>
        <Text type={TEXT_TYPES.SUPPORTING}>Time</Text>
      </Header>

      <Container className="better-scroll">
        {vm.trades.map((trade) => (
          <Row key={"trade" + trade.id}>
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

  ${Text}:first-of-type {
    text-align: start;
  }

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

  align-items: center;
  justify-content: space-between;

  margin-bottom: 2px;

  ${Text}:last-of-type {
    text-align: end;
  }
`;
