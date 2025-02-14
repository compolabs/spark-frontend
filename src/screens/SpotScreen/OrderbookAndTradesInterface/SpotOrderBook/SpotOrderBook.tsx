import React, { HTMLAttributes, useMemo } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { CompressedNumber } from "@components/CompressedNumber";
import { Column, Row } from "@components/Flex";
import { SpotOrderSettingsSheet } from "@components/Modal";
import Select from "@components/Select";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import Tooltip from "@components/Tooltip";
import { media } from "@themes/breakpoints";

import sellAndBuyIcon from "@assets/icons/buyAndSellOrderBookIcon.svg";
import buyIcon from "@assets/icons/buyOrderBookIcon.svg";
import sellIcon from "@assets/icons/sellOrderBookIcon.svg";

import useFlag from "@hooks/useFlag";
import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";

import { DEFAULT_DECIMALS } from "@constants";
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

const generateDecimalOptions = (decimals: number) => {
  return Array.from({ length: decimals + 1 })
    .map((_, index) => index)
    .reverse();
};

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

  const decimalOptions = useMemo(() => generateDecimalOptions(market?.precision ?? 0), []);

  const renderSettingsIcons = () => {
    if (media.mobile) {
      return <SettingIcon alt="filter" src={sellAndBuyIcon} onClick={openSettings} />;
    }
    return (
      <StyledSelect
        options={Object.entries(SPOT_SETTINGS_ICONS).map(([_, value], index) => ({
          title: (
            <SettingIcon
              key={index}
              alt="filter"
              selected={spotOrderBookStore.orderFilter === index}
              src={value}
              onClick={() => spotOrderBookStore.setOrderFilter(index)}
            />
          ),
          key: index.toString(),
        }))}
        selected={String(spotOrderBookStore.orderFilter ?? 0)}
        onSelect={(val) => spotOrderBookStore.setOrderFilter(Number(val.key))}
      />
    );
  };

  const renderPrices = () => {
    const buyOrder = [...spotOrderBookStore.buyOrders].reverse()[0];
    const sellOrder = [...spotOrderBookStore.sellOrders].reverse()[0];
    const precision = tradeStore.market?.precision ?? 0;
    const indexPriceBn = BN.formatUnits(spotOrderBookStore.lastTradePrice, DEFAULT_DECIMALS);
    const indexPrice = Number(indexPriceBn).toFixed(precision);

    const midPriceBn = new BN(buyOrder?.price).plus(sellOrder?.price).div(2);
    const price = BN.formatUnits(midPriceBn.isNaN() ? BN.ZERO : midPriceBn, DEFAULT_DECIMALS).toFixed(
      tradeStore.market?.precision ?? 0,
    );

    return (
      <PricesContainer>
        <Tooltip
          config={{
            placement: "bottom-start",
            trigger: "hover",
          }}
          content={
            <SmartFlex gap="20px" padding="8px" column>
              <Text>The latest Fill Price for the market</Text>
            </SmartFlex>
          }
        >
          <Text type={TEXT_TYPES.BODY} primary>
            {indexPrice}
          </Text>
        </Tooltip>
        <Tooltip
          config={{
            placement: "bottom-start",
            trigger: "hover",
          }}
          content={
            <SmartFlex gap="20px" padding="8px" column>
              <Text>Mid Price</Text>
            </SmartFlex>
          }
        >
          <Text type={TEXT_TYPES.BODY} secondary>
            {price}
          </Text>
        </Tooltip>
      </PricesContainer>
    );
  };

  const renderSpread = () => {
    const percent = spotOrderBookStore.isSpreadValid ? spotOrderBookStore.spreadPercent : "-";
    if (media.mobile) {
      return <></>;
    }

    return (
      <SpreadContainer>
        <Text type={TEXT_TYPES.SUPPORTING}>Spread</Text>
        <Text color={theme.colors.greenLight}>{`${percent}% `}</Text>
      </SpreadContainer>
    );
  };

  const indexOfDecimal = decimalOptions.indexOf(spotOrderBookStore.decimalGroup);

  const handleDecimalSelect = (index: string) => {
    const value = decimalOptions[Number(index)];
    spotOrderBookStore.setDecimalGroup(value);
  };

  const renderOrders = (orders: SpotMarketOrder[], type: "sell" | "buy") => {
    const orderMode = type === "sell" ? ORDER_MODE.BUY : ORDER_MODE.SELL;
    const volumePercent = (ord: SpotMarketOrder) =>
      type === "sell"
        ? ord.initialAmount.div(spotOrderBookStore.totalSell)
        : ord.initialQuoteAmount.div(spotOrderBookStore.totalBuy);
    const color = type === "sell" ? theme.colors.redLight : theme.colors.greenLight;
    const newOrder = [...orders].reverse();

    return (
      <>
        {newOrder.map((o, index) => (
          <OrderRow key={index + "order"} type={type} onClick={() => orderSpotVm.selectOrderbookOrder(o, orderMode)}>
            <VolumeBar type={type} volumePercent={volumePercent(o).times(100).toNumber()} />
            <TextOverflow color={color}>
              <CompressedNumber precision={spotOrderBookStore.decimalGroup} value={o.priceUnits} />
            </TextOverflow>
            <TextRightAlign primary>
              <CompressedNumber precision={4} value={o.currentAmountUnits} compact />
            </TextRightAlign>
            <TextRightAlign primary>
              <CompressedNumber precision={spotOrderBookStore.decimalGroup} value={o.currentQuoteAmountUnits} compact />
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
            options={decimalOptions.map((v, index) => ({
              title: new BN(10).pow(-v).toString(),
              key: index.toString(),
            }))}
            selected={String(indexOfDecimal)}
            onSelect={({ key }) => handleDecimalSelect(key)}
          />
          {renderSettingsIcons()}
          {renderSpread()}
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
                {renderPrices()}
                <SmartFlexOrder>{renderOrders(spotOrderBookStore.buyOrders, "buy")}</SmartFlexOrder>
              </OrderBookColumn>
            )}
          </Container>

          <SpotOrderSettingsSheet
            decimals={decimalOptions}
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
  gap: 0px;

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
  min-width: 74px;
  height: 40px;
`;

const PricesContainer = styled(SmartFlex)`
  height: 28px;
  width: 100%;
  background: ${({ theme }) => theme.colors.accentPrimary};
  margin: 2px 0px;
  padding: 0px 12px;
  align-items: center;
  gap: 8px;
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
  flex-direction: column;
  height: 100%;
  align-items: flex-end;
  justify-content: center;
  gap: 5px;
  width: auto;
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
