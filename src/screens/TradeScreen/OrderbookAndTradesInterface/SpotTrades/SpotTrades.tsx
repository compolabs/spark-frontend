import React, { useCallback, useEffect } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import {
  SpotTradesVMProvider,
  useSpotTradesVM,
} from "@screens/TradeScreen/OrderbookAndTradesInterface/SpotTrades/SpotTradesVM";
import { SmartFlex } from "@src/components/SmartFlex";
import { useEventListener } from "@src/hooks/useEventListener";
import { useMedia } from "@src/hooks/useMedia";

const SpotTradesImpl: React.FC = observer(() => {
  const vm = useSpotTradesVM();
  const theme = useTheme();
  const media = useMedia();

  useEffect(() => {
    vm.calcSize(media.mobile);
  }, [media.mobile]);

  const handleCalcSize = useCallback(() => {
    vm.calcSize(media.mobile);
  }, [media.mobile]);

  useEventListener("resize", handleCalcSize);

  const trades = vm.trades.slice(-vm.amountOfOrders);
  if (trades.length === 0)
    return (
      <Root alignItems="center" justifyContent="center" mainAxisSize="stretch">
        <Text type={TEXT_TYPES.SUPPORTING}>No trades yet</Text>
      </Root>
    );

  return (
    <Root>
      <SizedBox height={8} />
      <Header>
        {/*todo добавить описание из tradeStore в каком токене столбец (например Price USDC | Qty BTC)*/}
        <Text type={TEXT_TYPES.SUPPORTING}>Price</Text>
        <Text type={TEXT_TYPES.SUPPORTING}>Qty</Text>
        <Text type={TEXT_TYPES.SUPPORTING}>Time</Text>
      </Header>
      <SizedBox height={8} />

      <Container className="better-scroll">
        {trades.map((trade) => (
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
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  padding: 0 12px;
  text-align: center;
  height: 26px;
  align-items: center;

  ${Text}:last-of-type {
    text-align: end;
  }
`;

const Container = styled.div<{
  fitContent?: boolean;
  reverse?: boolean;
}>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  ${({ fitContent }) => !fitContent && "height: 100%;"};
  ${({ reverse }) => reverse && "flex-direction: column-reverse;"};
  height: 100%;
  box-sizing: border-box;
  padding: 0 12px;
  overflow-y: auto;
  max-height: calc(100vh - 245px);

  gap: 2px;
`;

const Row = styled(SmartFlex)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  ${Text}:last-of-type {
    text-align: end;
  }
`;
