import React, { HTMLAttributes } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";
import numeral from "numeral";

import { Row } from "@components/Flex";
import { SpotOrderSettingsSheet } from "@components/Modal";
import Select from "@components/Select";
import OrderbookAndTradesSkeletonWrapper from "@components/Skeletons/OrderbookAndTradesSkeletonWrapper";
import { SmartFlex } from "@components/SmartFlex";
import TableOrderBook, { ColumnProps, DataArray, SPOT_ORDER_FILTER } from "@components/TableOrderBook/TableOrderBook";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import sellAndBuyIcon from "@assets/icons/buyAndSellOrderBookIcon.svg";
import buyIcon from "@assets/icons/buyOrderBookIcon.svg";
import sellIcon from "@assets/icons/sellOrderBookIcon.svg";

import useFlag from "@hooks/useFlag";
import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";

import BN from "@utils/BN";

import { PerpMarketOrder } from "@entity";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

const SPOT_DECIMAL_OPTIONS = [0, 1, 2, 3];

interface OrderBookData {
  firstData: DataArray[];
  secondData?: DataArray[];
}

const SPOT_SETTINGS_ICONS = {
  [SPOT_ORDER_FILTER.SELL_AND_BUY]: sellAndBuyIcon,
  [SPOT_ORDER_FILTER.SELL]: sellIcon,
  [SPOT_ORDER_FILTER.BUY]: buyIcon,
};

export const PerpOrderBook: React.FC<IProps> = observer(() => {
  const { perpOrderBookStore } = useStores();
  const media = useMedia();
  const { marketStore } = useStores();
  const market = marketStore.market;
  const column: ColumnProps[] = [
    {
      title: `Price ${market?.quoteToken.symbol}`,
      align: "left",
    },
    {
      title: `Amount ${market?.baseToken.symbol}`,
      align: "right",
    },
    {
      title: "Total",
      align: "right",
    },
  ];

  const config = {
    orderFilter: perpOrderBookStore.orderFilter,
    isSpreadValid: perpOrderBookStore.isSpreadValid,
    spreadPrice: perpOrderBookStore.spreadPrice,
    spreadPercent: perpOrderBookStore.spreadPercent,
    decimalGroup: perpOrderBookStore.decimalGroup,
  };

  const [isSettingsOpen, openSettings, closeSettings] = useFlag();

  const isOrderBookEmpty =
    perpOrderBookStore.allBuyOrders.length === 0 && perpOrderBookStore.allSellOrders.length === 0;
  const renderSettingsIcons = () => {
    if (media.mobile) {
      return <SettingIcon alt="filter" src={sellAndBuyIcon} onClick={openSettings} />;
    }

    return Object.entries(SPOT_SETTINGS_ICONS).map(([_, value], index) => (
      <SettingIcon
        key={index}
        alt="filter"
        selected={perpOrderBookStore.orderFilter === index}
        src={value}
        onClick={() => perpOrderBookStore.setOrderFilter(index)}
      />
    ));
  };

  const indexOfDecimal = SPOT_DECIMAL_OPTIONS.indexOf(perpOrderBookStore.decimalGroup);

  const handleDecimalSelect = (index: string) => {
    const value = SPOT_DECIMAL_OPTIONS[Number(index)];
    perpOrderBookStore.setDecimalGroup(value);
  };

  const renderOrders = (orders: PerpMarketOrder[], type: "sell" | "buy") => {
    const newOrder = [...orders];
    newOrder.reverse();
    return newOrder.map(
      (o): DataArray => [
        o.priceUnits.toFormat(perpOrderBookStore.decimalGroup),
        numeral(o.baseSize).format(`0.${"0".repeat(4)}a`),
        numeral(o.currentQuoteAmountUnits).format(`0.${"0".repeat(perpOrderBookStore.decimalGroup)}a`),
        type === "sell",
      ],
    );
  };

  if (isOrderBookEmpty) {
    return (
      <Root center column>
        <Text type={TEXT_TYPES.SUPPORTING}>No orders yet</Text>
      </Root>
    );
  }

  const orderBook = (): OrderBookData => {
    if (perpOrderBookStore.orderFilter === SPOT_ORDER_FILTER.SELL) {
      return {
        firstData: renderOrders(perpOrderBookStore.allSellOrders, "sell"),
      };
    }
    if (perpOrderBookStore.orderFilter === SPOT_ORDER_FILTER.BUY) {
      return {
        firstData: renderOrders(perpOrderBookStore.allBuyOrders, "buy"),
      };
    }
    return {
      firstData: renderOrders(perpOrderBookStore.allBuyOrders, "buy"),
      secondData: renderOrders(perpOrderBookStore.allSellOrders, "sell"),
    };
  };
  const orderBookResult: OrderBookData = orderBook();

  return (
    <OrderbookAndTradesSkeletonWrapper isReady={!perpOrderBookStore.isOrderBookLoading}>
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
          <TableOrderBook
            column={column}
            config={config}
            firstData={orderBookResult.firstData}
            secondData={orderBookResult?.secondData ?? []}
          />
          <SpotOrderSettingsSheet
            decimals={SPOT_DECIMAL_OPTIONS}
            filterIcons={Object.entries(SPOT_SETTINGS_ICONS).map(([_, value]) => value)}
            isOpen={isSettingsOpen}
            selectedDecimal={String(indexOfDecimal)}
            selectedFilter={perpOrderBookStore.orderFilter}
            onClose={closeSettings}
            onDecimalSelect={handleDecimalSelect}
            onFilterSelect={perpOrderBookStore.setOrderFilter}
          />
        </OrderbookContainer>
      </Root>
    </OrderbookAndTradesSkeletonWrapper>
  );
});

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

const OrderbookContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  gap: 2px;
`;

export { SPOT_ORDER_FILTER };