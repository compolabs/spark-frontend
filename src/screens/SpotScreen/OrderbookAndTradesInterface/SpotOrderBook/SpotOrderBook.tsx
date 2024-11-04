import React, { HTMLAttributes } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";
import numeral from "numeral";

import { Column, Row } from "@components/Flex";
import { SpotOrderSettingsSheet } from "@components/Modal";
import Select from "@components/Select";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import sellAndBuyIcon from "@assets/icons/buyAndSellOrderBookIcon.svg";
import buyIcon from "@assets/icons/buyOrderBookIcon.svg";
import sellIcon from "@assets/icons/sellOrderBookIcon.svg";

import useFlag from "@hooks/useFlag";
import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";

import BN from "@utils/BN";
import { hexToRgba } from "@utils/hexToRgb";

import { SpotMarketOrder } from "@entity";

import OrderbookAndTradesSkeletonWrapper from "../../../../components/Skeletons/OrderbookAndTradesSkeletonWrapper";
import { ORDER_MODE, useCreateOrderVM } from "../../RightBlock/CreateOrder/CreateOrderVM";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

export enum SPOT_ORDER_FILTER {
  SELL_AND_BUY = 0,
  SELL = 1,
  BUY = 2,
}

const SPOT_DECIMAL_OPTIONS = [0, 1, 2, 3];

const SPOT_SETTINGS_ICONS = {
  [SPOT_ORDER_FILTER.SELL_AND_BUY]: sellAndBuyIcon,
  [SPOT_ORDER_FILTER.SELL]: sellIcon,
  [SPOT_ORDER_FILTER.BUY]: buyIcon,
};

export const SpotOrderBook: React.FC<IProps> = observer(() => {
  const { spotOrderBookStore } = useStores();
  const orderSpotVm = useCreateOrderVM();
  const media = useMedia();
  const theme = useTheme();
  const { tradeStore } = useStores();
  const market = tradeStore.market;

  const [isSettingsOpen, openSettings, closeSettings] = useFlag();

  const isOrderBookEmpty =
    spotOrderBookStore.allBuyOrders.length === 0 && spotOrderBookStore.allSellOrders.length === 0;

  const renderSettingsIcons = () => {
    if (media.mobile) {
      return <SettingIcon alt="filter" src={sellAndBuyIcon} onClick={openSettings} />;
    }

    return Object.entries(SPOT_SETTINGS_ICONS).map(([_, value], index) => (
      <SettingIcon
        key={index}
        alt="filter"
        selected={spotOrderBookStore.orderFilter === index}
        src={value}
        onClick={() => spotOrderBookStore.setOrderFilter(index)}
      />
    ));
  };

  const renderSpread = () => {
    let price = spotOrderBookStore.isSpreadValid ? spotOrderBookStore.spreadPrice : "-";
    price = price === "-" ? price : numeral(price).format(`0.${"0".repeat(spotOrderBookStore.decimalGroup)}a`);
    const percent = spotOrderBookStore.isSpreadValid ? spotOrderBookStore.spreadPercent : "-";
    if (media.mobile) {
      return (
        <SpreadContainer>
          <Text type={TEXT_TYPES.H} primary>
            {price}
          </Text>
          <Text>{`(${percent}%)`}</Text>
        </SpreadContainer>
      );
    }

    return (
      <SpreadContainer>
        <Text type={TEXT_TYPES.SUPPORTING}>SPREAD</Text>
        <Text primary>{price}</Text>
        <Text>{`(${percent}%) `}</Text>
      </SpreadContainer>
    );
  };

  const indexOfDecimal = SPOT_DECIMAL_OPTIONS.indexOf(spotOrderBookStore.decimalGroup);

  const handleDecimalSelect = (index: string) => {
    const value = SPOT_DECIMAL_OPTIONS[Number(index)];
    spotOrderBookStore.setDecimalGroup(value);
  };

  const renderOrders = (orders: SpotMarketOrder[], type: "sell" | "buy") => {
    const orderMode = type === "sell" ? ORDER_MODE.BUY : ORDER_MODE.SELL;
    const volumePercent = (ord: SpotMarketOrder) =>
      type === "sell"
        ? ord.initialAmount.div(spotOrderBookStore.totalSell)
        : ord.initialQuoteAmount.div(spotOrderBookStore.totalBuy);
    const color = type === "sell" ? theme.colors.redLight : theme.colors.greenLight;
    const newOrder = [...orders];
    newOrder.reverse();
    return (
      <>
        {newOrder.map((o, index) => (
          <OrderRow key={index + "order"} type={type} onClick={() => orderSpotVm.selectOrderbookOrder(o, orderMode)}>
            <VolumeBar type={type} volumePercent={volumePercent(o).times(100).toNumber()} />
            <TextOverflow color={color}>{o.priceUnits.toFormat(spotOrderBookStore.decimalGroup)}</TextOverflow>
            <TextRightAlign primary>{numeral(o.currentAmountUnits).format(`0.${"0".repeat(4)}a`)}</TextRightAlign>
            <TextRightAlign primary>
              {numeral(o.currentQuoteAmountUnits).format(`0.${"0".repeat(spotOrderBookStore.decimalGroup)}a`)}
            </TextRightAlign>
          </OrderRow>
        ))}
        <Plug length={70 - orders.length} />
      </>
    );
  };

  if (isOrderBookEmpty) {
    return (
      <Root center column>
        <Text type={TEXT_TYPES.SUPPORTING}>No orders yet</Text>
      </Root>
    );
  }
  return (
    <OrderbookAndTradesSkeletonWrapper isReady={!spotOrderBookStore.isOrderBookLoading}>
      <Root>
        <SettingsContainer>
          <StyledSelect
            options={SPOT_DECIMAL_OPTIONS.map((v, index) => ({
              title: new BN(10).pow(-v).toString(),
              key: index.toString(),
            }))}
            selected={String(indexOfDecimal)}
            onSelect={({ key }) => handleDecimalSelect(key)}
          />
          {renderSettingsIcons()}
        </SettingsContainer>
        <OrderbookContainer>
          <OrderBookHeader>
            <Text type={TEXT_TYPES.SUPPORTING}>{`Price  ${market?.quoteToken.symbol}`}</Text>
            <TextRightAlign type={TEXT_TYPES.SUPPORTING}>{`Amount ${market?.baseToken.symbol}`}</TextRightAlign>
            <TextRightAlign type={TEXT_TYPES.SUPPORTING}>Total</TextRightAlign>
          </OrderBookHeader>
          <Container
            fitContent={
              spotOrderBookStore.orderFilter === SPOT_ORDER_FILTER.SELL ||
              spotOrderBookStore.orderFilter === SPOT_ORDER_FILTER.BUY
            }
            // reverse={spotOrderBookStore.orderFilter === SPOT_ORDER_FILTER.SELL}
          >
            {spotOrderBookStore.orderFilter === SPOT_ORDER_FILTER.BUY && (
              <SmartFlexOrder>{renderOrders(spotOrderBookStore.buyOrders, "buy")}</SmartFlexOrder>
            )}
            {spotOrderBookStore.orderFilter === SPOT_ORDER_FILTER.SELL && (
              <SmartFlexOrder>{renderOrders(spotOrderBookStore.sellOrders, "sell")}</SmartFlexOrder>
            )}
            {spotOrderBookStore.orderFilter === SPOT_ORDER_FILTER.SELL_AND_BUY && (
              <OrderBookColumn>
                <SmartFlexOrder flexDirection="column-reverse">
                  {renderOrders(spotOrderBookStore.sellOrders, "sell")}
                </SmartFlexOrder>
                {renderSpread()}
                <SmartFlexOrder>{renderOrders(spotOrderBookStore.buyOrders, "buy")}</SmartFlexOrder>
              </OrderBookColumn>
            )}
          </Container>

          <SpotOrderSettingsSheet
            decimals={SPOT_DECIMAL_OPTIONS}
            filterIcons={Object.entries(SPOT_SETTINGS_ICONS).map(([_, value]) => value)}
            isOpen={isSettingsOpen}
            selectedDecimal={String(indexOfDecimal)}
            selectedFilter={spotOrderBookStore.orderFilter}
            onClose={closeSettings}
            onDecimalSelect={handleDecimalSelect}
            onFilterSelect={spotOrderBookStore.setOrderFilter}
          />
        </OrderbookContainer>
      </Root>
    </OrderbookAndTradesSkeletonWrapper>
  );
});

const Plug: React.FC<{
  length: number;
}> = ({ length }) => (
  <>
    {Array.from({ length }).map((_, index) => (
      <PlugContainer key={index + "positive-plug"}>
        <Text>-</Text>
        <Text>-</Text>
        <Text>-</Text>
      </PlugContainer>
    ))}
  </>
);

const SmartFlexOrder = styled(SmartFlex)<{ flexDirection?: string }>`
  flex-direction: ${({ flexDirection }) => flexDirection ?? "column"};
  flex-grow: 1;
  width: 100%;
  height: 0;
  overflow: hidden;
`;

const OrderBookColumn = styled(Column)`
  height: 100%;
  width: 100%;
`;

const TextOverflow = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PlugContainer = styled(SmartFlex)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 1px;
  height: 16px;
  width: 100%;
  padding: 0 12px;
  text-align: center;
  gap: 10px;

  ${Text} {
    text-align: start;
  }

  ${media.mobile} {
    grid-template-columns: repeat(2, 1fr);

    ${Text}:nth-of-type(2) {
      text-align: end;
    }

    ${Text}:nth-of-type(3) {
      display: none;
    }
  }
`;

const Root = styled(SmartFlex)`
  grid-area: orderbook;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 8px;

  ${media.mobile} {
    padding: 8px 0;
  }
`;

const SettingsContainer = styled(Row)`
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 12px;
  gap: 8px;

  ${media.mobile} {
    order: 3;
    padding: 0 8px;
    flex-direction: row-reverse;
  }
`;

const SettingIcon = styled.img<{ selected?: boolean }>`
  cursor: pointer;
  transition: 0.4s;
  border-radius: 4px;
  border: 1px solid ${({ selected, theme }) => (selected ? theme.colors.borderAccent : "transparent")};

  &:hover {
    border: 1px solid ${({ selected, theme }) => (selected ? theme.colors.borderAccent : theme.colors.borderPrimary)};
  }
`;

const TextRightAlign = styled(Text)`
  text-align: right !important;
`;

const StyledSelect = styled(Select<string>)`
  min-width: 84px;
  height: 40px;
`;

const OrderBookHeader = styled.div`
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
    ${TextRightAlign}:nth-of-type(2) {
      display: none;
    }
  }
`;

const OrderRow = styled(Row)<{ type: "buy" | "sell" }>`
  position: relative;
  cursor: pointer;
  height: 16px;
  width: 100%;
  //justify-content: space-between;
  //align-items: center;
  padding: 0 12px;
  background: transparent;
  transition: 0.4s;
  gap: 10px;

  &:hover {
    background: ${({ type, theme }) =>
      type === "buy" ? hexToRgba(theme.colors.greenLight, 0.1) : hexToRgba(theme.colors.redLight, 0.1)};
  }

  ${media.mobile} {
    gap: 3px;
    & > ${TextRightAlign}:nth-of-type(2) {
      display: none;
    }
  }

  & > div {
    flex: 1;
    text-align: left;
    z-index: 1;
  }
`;

const OrderbookContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  gap: 2px;
`;

const Container = styled(OrderbookContainer)<{
  fitContent?: boolean;
  reverse?: boolean;
}>`
  ${({ fitContent }) => !fitContent && "height: 100%;"};
  ${({ reverse }) => reverse && "flex-direction: column-reverse;"};
  ${({ reverse }) => (reverse ? "justify-content: flex-end;" : "justify-content: flex-start;")};
  height: 100%;

  ${media.mobile} {
    justify-content: flex-start;
  }
`;

const SpreadContainer = styled(SmartFlex)`
  padding-left: 12px;
  height: 24px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  align-items: center;
  gap: 12px;
  width: 100%;
`;

const ProgressBar = styled.span<{ type: "buy" | "sell"; fulfillPercent?: number }>`
  z-index: 0;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: ${({ type, theme }) =>
    type === "buy" ? hexToRgba(theme.colors.greenLight, 0.1) : hexToRgba(theme.colors.redLight, 0.1)};
  transition: all 0.3s;
  width: ${({ fulfillPercent }) => (fulfillPercent ? `${fulfillPercent}%` : `0%`)};
`;

const VolumeBar = styled(ProgressBar)<{ volumePercent?: number }>`
  width: ${({ volumePercent }) => (volumePercent ? `${volumePercent}%` : `0%`)};
`;
