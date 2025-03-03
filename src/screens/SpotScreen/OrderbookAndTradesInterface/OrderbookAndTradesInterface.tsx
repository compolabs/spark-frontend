import React, { useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import Button, { ButtonGroup } from "@components/Button";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";

import { useStores } from "@stores";

import OrderbookAndTradesSkeletonWrapper from "../../../components/Skeletons/OrderbookAndTradesSkeletonWrapper";

import { SpotOrderBook } from "./SpotOrderBook/SpotOrderBook";
import { SpotTrades } from "./SpotTrades/SpotTrades";
const OrderbookAndTradesInterface: React.FC = observer(() => {
  const [isOrderbook, setIsOrderbook] = useState(true);

  const { spotOrderBookStore } = useStores();

  return (
    <OrderbookAndTradesSkeletonWrapper isReady={!spotOrderBookStore.isOrderBookLoading}>
      <Root>
        <ButtonGroup style={{ padding: "0 12px" }}>
          <Button active={isOrderbook} onClick={() => setIsOrderbook(true)}>
            <Text primary={isOrderbook} type="BUTTON_SECONDARY">
              orderbook
            </Text>
          </Button>
          <Button active={!isOrderbook} onClick={() => setIsOrderbook(false)}>
            <Text primary={!isOrderbook} type="BUTTON_SECONDARY">
              trades
            </Text>
          </Button>
        </ButtonGroup>
        <SizedBox height={8} />
        {isOrderbook ? <SpotOrderBook /> : <SpotTrades />}
      </Root>
    </OrderbookAndTradesSkeletonWrapper>
  );
});

export default OrderbookAndTradesInterface;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding-top: 12px;
  flex: 2;
  max-width: 273px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  max-height: 100%;
  overflow: hidden;
`;
