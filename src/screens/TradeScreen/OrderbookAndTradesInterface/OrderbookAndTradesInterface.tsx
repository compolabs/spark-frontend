import React, { useState } from "react";
import styled from "@emotion/styled";

import Button, { ButtonGroup } from "@components/Button";
import SizedBox from "@components/SizedBox";
import SpotOrderBook from "@screens/TradeScreen/OrderbookAndTradesInterface/SpotOrderBook";
import SpotTrades from "@screens/TradeScreen/OrderbookAndTradesInterface/SpotTrades";
import Text, { TEXT_TYPES } from "@src/components/Text";

const OrderbookAndTradesInterface: React.FC = () => {
  const [isOrderbook, setIsOrderbook] = useState(true);
  return (
    <Root>
      <ButtonGroup style={{ padding: "0 12px" }}>
        <Button active={isOrderbook} onClick={() => setIsOrderbook(true)}>
          <Text primary={isOrderbook} type={TEXT_TYPES.BUTTON_SECONDARY}>
            orderbook
          </Text>
        </Button>
        <Button active={!isOrderbook} onClick={() => setIsOrderbook(false)}>
          <Text primary={!isOrderbook} type={TEXT_TYPES.BUTTON_SECONDARY}>
            trades
          </Text>
        </Button>
      </ButtonGroup>
      <SizedBox height={8} />
      {isOrderbook ? <SpotOrderBook /> : <SpotTrades />}
    </Root>
  );
};

export default OrderbookAndTradesInterface;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 12px 0;
  flex: 2;
  max-width: 273px;
  height: 100%;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.bgSecondary};
`;
