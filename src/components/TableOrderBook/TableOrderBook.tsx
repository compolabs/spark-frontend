import React from "react";
import styled from "@emotion/styled";

import { Column } from "@components/Flex";
import HistoryOrderBook from "@components/TableOrderBook/HistoryOrderBook";
import SellAndBuy from "@components/TableOrderBook/SellAndBuy";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

export interface ColumnProps {
  title: string;
  align: "left" | "center" | "right";
}

export enum SPOT_ORDER_FILTER {
  SELL_AND_BUY = 0,
  SELL = 1,
  BUY = 2,
  HISTORY = 3,
}

export type DataArray = [string, string, string, boolean]; // первые 3 это данные, 4 это направление цены

export interface ConfigProps {
  orderFilter: SPOT_ORDER_FILTER;
  isSpreadValid?: boolean;
  spreadPrice?: string;
  spreadPercent?: string;
  decimalGroup?: number;
}

interface TableOrderBookProps {
  column: ColumnProps[];
  firstData: DataArray[];
  secondData?: DataArray[];
  config: ConfigProps;
}
const TableOrderBook = ({ column, firstData, secondData, config }: TableOrderBookProps) => {
  const isDataEmpty = firstData.length === 0;
  if (isDataEmpty)
    return (
      <Root alignItems="center" justifyContent="center" mainAxisSize="stretch">
        <Text type={TEXT_TYPES.SUPPORTING}>No trades yet</Text>
      </Root>
    );
  const renderOrderBook = () => {
    if (config.orderFilter === SPOT_ORDER_FILTER.SELL_AND_BUY) {
      return <SellAndBuy config={config} firstData={firstData} secondData={secondData} />;
    }
    return <HistoryOrderBook data={firstData} />;
  };
  return (
    <Root>
      <Header>
        {column.map((el) => (
          <TextStyled key={el.title} align={el.align} type={TEXT_TYPES.SUPPORTING}>
            {el.title}
          </TextStyled>
        ))}
      </Header>
      {renderOrderBook()}
    </Root>
  );
};

export default TableOrderBook;

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

const TextStyled = styled(Text)<{ align: string }>`
  ${({ align }) => `text-align: ${align};`};
`;
