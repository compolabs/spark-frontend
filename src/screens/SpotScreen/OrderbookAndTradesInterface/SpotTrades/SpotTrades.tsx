import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import Loader from "@components/Loader";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import { useStores } from "@stores";

export const SpotTrades: React.FC = observer(() => {
  const { spotOrderBookStore } = useStores();
  const theme = useTheme();

  const isOrderBookEmpty = spotOrderBookStore.trades.length === 0;

  if (spotOrderBookStore.isTradesLoading && isOrderBookEmpty) {
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
        <TextRightAlign type={TEXT_TYPES.SUPPORTING}>Qty</TextRightAlign>
        <TextRightAlign type={TEXT_TYPES.SUPPORTING}>Time</TextRightAlign>
      </Header>

      <Container className="better-scroll">
        {spotOrderBookStore.trades.map((trade) => (
          <Row key={"trade" + trade.id}>
            <Text color={trade.sellerIsMaker ? theme.colors.redLight : theme.colors.greenLight} type={TEXT_TYPES.BODY}>
              {trade.formatPrice}
            </Text>
            <TextRightAlign color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
              {trade.formatTradeAmount}
            </TextRightAlign>
            <TextRightAlign color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
              {trade.timestamp.format("HH:mm:ss")}
            </TextRightAlign>
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
  gap: 10px;

  ${Text} {
    text-align: start;
  }

  ${media.mobile} {
    grid-template-columns: 1fr min-content;

    ${Text}:nth-of-type(2) {
      text-align: end;
    }
    ${Text}:nth-of-type(3) {
      display: none;
    }
  }
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  padding: 5px 12px 8px;
  overflow-y: auto;
  height: 100%;
`;

const Row = styled(SmartFlex)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  height: 16px;

  gap: 10px;

  align-items: center;
  justify-content: space-between;
`;

const TextRightAlign = styled(Text)`
  text-align: right !important;
`;
