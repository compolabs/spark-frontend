import React from "react";
import { observer } from "mobx-react";

import Loader from "@components/Loader.tsx";
import TableOrderBook, { ColumnProps, DataArray } from "@components/TableOrderBook/TableOrderBook";

import { useStores } from "@stores";
const column: ColumnProps[] = [
  {
    title: "Price",
    align: "left",
  },
  {
    title: "Qty",
    align: "right",
  },
  {
    title: "Time",
    align: "right",
  },
];

const config = {
  orderFilter: 3,
};

export const PerpTrades: React.FC = observer(() => {
  const { perpOrderBookStore } = useStores();

  const isOrderBookEmpty = perpOrderBookStore.trades.length === 0;

  if (perpOrderBookStore.isTradesLoading && isOrderBookEmpty) {
    return <Loader size={32} hideText />;
  }

  const formatDataTrades: DataArray[] = perpOrderBookStore.trades.map((trade) => [
    trade.formatPrice,
    trade.formatTradeAmount,
    trade.timestamp.format("HH:mm:ss"),
    false,
    // trade.sellerIsMaker,
  ]);

  return <TableOrderBook column={column} config={config} firstData={formatDataTrades} />;
});
