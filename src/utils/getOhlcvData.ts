import { HistogramData, UTCTimestamp } from "lightweight-charts";

import { TradeOrderEvent } from "@compolabs/spark-orderbook-ts-sdk";

export interface OhlcvData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

type Interval = "1m" | "5m" | "30m" | "1h" | "1d";

const getIntervalMilliseconds = (interval: Interval): number => {
  switch (interval) {
    case "1m":
      return 60 * 1000;
    case "5m":
      return 5 * 60 * 1000;
    case "30m":
      return 30 * 60 * 1000;
    case "1h":
      return 60 * 60 * 1000;
    case "1d":
      return 24 * 60 * 60 * 1000;
    default:
      return 60 * 1000;
  }
};

export const getOhlcvData = (events: TradeOrderEvent[] | TradeOrderEvent, currentInterval: Interval) => {
  const ohlcvMap = new Map<number, OhlcvData>();

  const eventArray = Array.isArray(events) ? events : [events];

  const trades = eventArray.map((event) => {
    const { timestamp, tradePrice, tradeSize } = event;

    const time = Math.floor(new Date(timestamp).getTime() / 1000);

    // Parse and scale price
    const parsedPrice = parseFloat(tradePrice);
    const price = parsedPrice / 1e9;

    // Parse and scale volume
    const parsedSize = parseFloat(tradeSize);
    const volume = parsedSize / 1e8;

    return { time, price, volume };
  });

  const interval = getIntervalMilliseconds(currentInterval);

  trades.forEach((trade) => {
    const intervalStart = Math.floor((trade.time * 1000) / interval) * interval;
    let ohlcv = ohlcvMap.get(intervalStart);

    if (!ohlcv) {
      ohlcv = {
        time: Math.floor(intervalStart / 1000) as UTCTimestamp,
        open: trade.price,
        high: trade.price,
        low: trade.price,
        close: trade.price,
        volume: trade.volume,
      };
    } else {
      ohlcv.high = Math.max(ohlcv.high, trade.price);
      ohlcv.low = Math.min(ohlcv.low, trade.price);
      ohlcv.close = trade.price;
      ohlcv.volume += trade.volume;
    }

    ohlcvMap.set(intervalStart, ohlcv);
  });

  const intervals = Array.from(ohlcvMap.keys()).sort((a, b) => a - b);

  if (intervals.length === 0) {
    return {
      ohlcvMap: new Map(),
      ohlcvData: [] as OhlcvData[],
      historgramData: [] as HistogramData[],
    };
  }

  const earliestInterval = intervals[0];
  const latestInterval = intervals[intervals.length - 1];

  let previousClose: number | null = null;

  for (let intervalStart = earliestInterval; intervalStart <= latestInterval; intervalStart += interval) {
    if (!ohlcvMap.has(intervalStart)) {
      const closePrice = previousClose !== null ? previousClose : 0;

      ohlcvMap.set(intervalStart, {
        time: Math.floor(intervalStart / 1000) as UTCTimestamp,
        open: closePrice,
        high: closePrice,
        low: closePrice,
        close: closePrice,
        volume: 0,
      });
    } else {
      const ohlcv = ohlcvMap.get(intervalStart)!;
      previousClose = ohlcv.close;
    }
  }

  const ohlcvData = Array.from(ohlcvMap.values()).sort((a, b) => a.time - b.time);

  const historgramData: HistogramData[] = ohlcvData.map((d) => ({
    time: d.time,
    value: d.volume,
    color:
      d.close > d.open
        ? "#26a69a" // Greenish for up
        : d.close < d.open
          ? "#ef5350" // Reddish for down
          : "#888888", // Grey for no change
  }));

  return {
    ohlcvMap,
    ohlcvData,
    historgramData,
  };
};
