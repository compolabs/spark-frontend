import React, { HTMLAttributes, useCallback, useEffect } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";
import numeral from "numeral";

import sellAndBuyIcon from "@src/assets/icons/buyAndSellOrderBookIcon.svg";
import buyIcon from "@src/assets/icons/buyOrderBookIcon.svg";
import sellIcon from "@src/assets/icons/sellOrderBookIcon.svg";
import { Row } from "@src/components/Flex";
import Loader from "@src/components/Loader";
import { SpotOrderSettingsSheet } from "@src/components/Modal";
import Select from "@src/components/Select";
import { SmartFlex } from "@src/components/SmartFlex";
import Text, { TEXT_TYPES } from "@src/components/Text";
import { SpotMarketOrder } from "@src/entity";
import { useEventListener } from "@src/hooks/useEventListener";
import useFlag from "@src/hooks/useFlag";
import { useMedia } from "@src/hooks/useMedia";
import { media } from "@src/themes/breakpoints";
import BN from "@src/utils/BN";
import hexToRgba from "@src/utils/hexToRgb";
import { useStores } from "@stores";

import { ORDER_MODE, ORDER_TYPE, useCreateOrderVM } from "../../RightBlock/CreateOrder/CreateOrderVM";

import { useSpotOrderbookVM } from "./SpotOrderbookVM";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

export enum SPOT_ORDER_FILTER {
  SELL_AND_BUY = 0,
  SELL = 1,
  BUY = 2,
}

export const SPOT_DECIMAL_OPTIONS = [2, 3, 4, 5];

export const SPOT_SETTINGS_ICONS = {
  [SPOT_ORDER_FILTER.SELL_AND_BUY]: sellAndBuyIcon,
  [SPOT_ORDER_FILTER.SELL]: sellIcon,
  [SPOT_ORDER_FILTER.BUY]: buyIcon,
};

const SpotOrderBookImpl: React.FC<IProps> = observer(() => {
  const vm = useSpotOrderbookVM();
  const orderSpotVm = useCreateOrderVM();
  const media = useMedia();
  const theme = useTheme();
  const { tradeStore, settingsStore } = useStores();
  const market = tradeStore.market;

  const [isSettingsOpen, openSettings, closeSettings] = useFlag();

  useEffect(() => {
    vm.calcSize(media.mobile);
  }, [media.mobile]);

  const handleCalcSize = useCallback(() => {
    vm.calcSize(media.mobile);
  }, [media.mobile]);

  useEventListener("resize", handleCalcSize);

  const isOrderBookEmpty = vm.orderbook.buy.length === 0 && vm.orderbook.sell.length === 0;

  if (vm.isOrderBookLoading && isOrderBookEmpty) {
    return <Loader size={32} hideText />;
  }

  if (isOrderBookEmpty) {
    return (
      <Root center column>
        <Text type={TEXT_TYPES.SUPPORTING}>No orders yet</Text>
      </Root>
    );
  }

  const renderSettingsIcons = () => {
    if (media.mobile) {
      return <SettingIcon alt="filter" src={sellAndBuyIcon} onClick={openSettings} />;
    }

    return Object.entries(SPOT_SETTINGS_ICONS).map(([key, value], index) => (
      <SettingIcon
        key={index}
        alt="filter"
        selected={vm.orderFilter === index}
        src={value}
        onClick={() => vm.setOrderFilter(index)}
      />
    ));
  };

  const renderSpread = () => {
    if (media.mobile) {
      return (
        <SpreadContainer>
          <Text type={TEXT_TYPES.H} primary>
            {vm.orderbook.spreadPrice.length ? vm.orderbook.spreadPrice : "0.00"}
          </Text>
          <Text>{`(${vm.orderbook.spreadPercent}%)`}</Text>
        </SpreadContainer>
      );
    }

    return (
      <SpreadContainer>
        <Text type={TEXT_TYPES.SUPPORTING}>SPREAD</Text>
        <Text primary>{vm.orderbook.spreadPrice}</Text>
        <Text>{`(${vm.orderbook.spreadPercent}%) `}</Text>
      </SpreadContainer>
    );
  };

  const decimals = SPOT_DECIMAL_OPTIONS[+vm.decimalKey];

  const renderOrders = (orders: SpotMarketOrder[], type: "sell" | "buy") => {
    const orderMode = type === "sell" ? ORDER_MODE.BUY : ORDER_MODE.SELL;
    const volumePercent = (ord: SpotMarketOrder) =>
      type === "sell" ? ord.baseSize.div(vm.totalSell) : ord.quoteSize.div(vm.totalBuy);
    const color = type === "sell" ? theme.colors.redLight : theme.colors.greenLight;

    return orders.map((o, index) => (
      <OrderRow
        key={index + "order"}
        type={type}
        onClick={() => {
          orderSpotVm.setOrderMode(orderMode);
          orderSpotVm.setInputPrice(o.price);
          orderSpotVm.setInputAmount(new BN(o.baseSize), true);
          settingsStore.setOrderType(ORDER_TYPE.Limit);
        }}
      >
        <VolumeBar type={type} volumePercent={volumePercent(o).times(100).toNumber()} />
        <Text primary>{o.baseSizeUnits.toSignificant(decimals)}</Text>
        <TextOverflow color={color}>{BN.formatUnits(o.price, 9).toFormat(decimals)}</TextOverflow>
        <Text primary>{numeral(o.quoteSizeUnits).format(`0.${"0".repeat(decimals)}a`)}</Text>
      </OrderRow>
    ));
  };

  return (
    <Root>
      <SettingsContainer>
        <StyledSelect
          options={SPOT_DECIMAL_OPTIONS.map((v, index) => ({
            title: new BN(10).pow(-v).toString(),
            key: index.toString(),
          }))}
          selected={vm.decimalKey}
          onSelect={({ key }) => vm.setDecimalKey(key)}
        />
        {renderSettingsIcons()}
      </SettingsContainer>
      <OrderbookContainer>
        <OrderBookHeader>
          <Text type={TEXT_TYPES.SUPPORTING}>{`Amount ${market?.baseToken.symbol}`}</Text>
          <Text type={TEXT_TYPES.SUPPORTING}>Price</Text>
          <Text type={TEXT_TYPES.SUPPORTING}>{`Total ${market?.quoteToken.symbol}`}</Text>
        </OrderBookHeader>
        <Container
          fitContent={vm.orderFilter === SPOT_ORDER_FILTER.SELL || vm.orderFilter === SPOT_ORDER_FILTER.BUY}
          reverse={vm.orderFilter === SPOT_ORDER_FILTER.SELL}
        >
          {vm.orderFilter === SPOT_ORDER_FILTER.SELL_AND_BUY && (
            <Plug
              length={vm.sellOrders.length < +vm.oneSizeOrders ? +vm.oneSizeOrders - 1 - vm.sellOrders.length : 0}
            />
          )}
          {vm.orderFilter === SPOT_ORDER_FILTER.SELL && (
            <Plug
              length={vm.sellOrders.length < +vm.amountOfOrders ? +vm.amountOfOrders - 1 - vm.sellOrders.length : 0}
            />
          )}

          {vm.orderFilter !== SPOT_ORDER_FILTER.BUY && renderOrders(vm.sellOrders, "sell")}

          {vm.orderFilter === SPOT_ORDER_FILTER.SELL_AND_BUY && renderSpread()}

          {vm.orderFilter !== SPOT_ORDER_FILTER.SELL && renderOrders(vm.buyOrders, "buy")}

          {vm.orderFilter === SPOT_ORDER_FILTER.BUY && (
            <Plug
              length={vm.buyOrders.length < +vm.amountOfOrders ? +vm.amountOfOrders - 1 - vm.buyOrders.length : 0}
            />
          )}
          {vm.orderFilter === SPOT_ORDER_FILTER.SELL_AND_BUY && (
            <Plug length={vm.buyOrders.length < +vm.oneSizeOrders ? +vm.oneSizeOrders - 1 - vm.buyOrders.length : 0} />
          )}
        </Container>

        <SpotOrderSettingsSheet
          decimals={SPOT_DECIMAL_OPTIONS}
          filterIcons={Object.entries(SPOT_SETTINGS_ICONS).map(([key, value]) => value)}
          isOpen={isSettingsOpen}
          selectedDecimal={vm.decimalKey}
          selectedFilter={vm.orderFilter}
          onClose={closeSettings}
          onDecimalSelect={vm.setDecimalKey}
          onFilterSelect={vm.setOrderFilter}
        />
      </OrderbookContainer>
    </Root>
  );
});

export default SpotOrderBookImpl;

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

  ${Text} {
    text-align: start;
  }

  ${Text}:last-of-type {
    text-align: end;
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
    ${Text}:nth-of-type(3) {
      display: none;
    }
  }
`;
const OrderRow = styled(Row)<{ type: "buy" | "sell" }>`
  position: relative;
  cursor: pointer;
  margin-bottom: 1px;
  height: 16px;
  width: 100%;
  justify-content: space-between;
  align-items: center;
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
    & > ${Text}:nth-of-type(2) {
      text-align: right;
    }
    & > ${Text}:nth-of-type(3) {
      display: none;
    }
  }

  & > ${Text}:nth-of-type(3) {
    text-align: left;
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
  ${media.mobile} {
    height: fit-content;
  }
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
