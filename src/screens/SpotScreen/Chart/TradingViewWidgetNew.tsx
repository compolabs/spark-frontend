import React, { useCallback, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { createChart, IChartApi, UTCTimestamp } from "lightweight-charts";

import { candlestickSeriesConfig, chartConfig, histogramConfig } from "@screens/SpotScreen/Chart/configChart";

import dataMock from "./mock.json";

interface TradeOrderEvent {
  id: string;
  tradePrice: string;
  tradeSize: string;
  timestamp: string;
}

interface OhlcvData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const oneMinuteMs = 60 * 1000;

const TradingViewWidgetNew: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const ohlcvMapRef = useRef<Map<number, OhlcvData>>(new Map());
  // TODO: сюда useState с data которая приходит
  const initializeChart = useCallback(() => {
    // TODO: не уверен что нужен callback
    if (chartContainerRef.current && !chartRef.current) {
      const newChart = createChart(chartContainerRef.current, chartConfig);
      chartRef.current = newChart;

      // Создаем candlestick и volume серии
      const candlestickSeries = newChart.addCandlestickSeries(candlestickSeriesConfig);
      const volumeSeries = newChart.addHistogramSeries(histogramConfig);

      // Применяем параметры для volume серии
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });

      // Сохраняем ссылки на серии
      chartRef.current = {
        chartInstance: newChart,
        candlestickSeries,
        volumeSeries,
      } as unknown as IChartApi & {
        // TODO: не знаю как правильно вынести такой тип
        candlestickSeries: ReturnType<typeof newChart.addCandlestickSeries>;
        volumeSeries: ReturnType<typeof newChart.addHistogramSeries>;
      };
    }
  }, []);

  useEffect(() => {
    initializeChart();
  }, []);

  const processTradeEvents = useCallback((events: TradeOrderEvent[] | TradeOrderEvent) => {
    const eventArray = Array.isArray(events) ? events : [events];
    const updatedOhlcvMap = new Map(ohlcvMapRef.current);

    eventArray.forEach(({ timestamp, tradePrice, tradeSize }, index) => {
      const time = Math.floor(new Date(timestamp).getTime() / 1000);
      const price = parseFloat(tradePrice) / 1e9;
      const volume = parseFloat(tradeSize) / 1e8;

      if (isNaN(time) || isNaN(price) || isNaN(volume)) {
        console.warn(`Invalid data at index ${index}`);
        return;
      }

      const intervalStart = Math.floor((time * 1000) / oneMinuteMs) * oneMinuteMs;
      const ohlcv = updatedOhlcvMap.get(intervalStart) || {
        time: (intervalStart / 1000) as UTCTimestamp,
        open: price,
        high: price,
        low: price,
        close: price,
        volume,
      };

      ohlcv.high = Math.max(ohlcv.high, price);
      ohlcv.low = Math.min(ohlcv.low, price);
      ohlcv.close = price;
      ohlcv.volume += volume;

      updatedOhlcvMap.set(intervalStart, ohlcv);
    });

    const sortedIntervals = Array.from(updatedOhlcvMap.keys()).sort((a, b) => a - b);
    let previousClose: number | null = null;

    sortedIntervals.forEach((intervalStart) => {
      if (!updatedOhlcvMap.has(intervalStart) && previousClose !== null) {
        updatedOhlcvMap.set(intervalStart, {
          time: (intervalStart / 1000) as UTCTimestamp,
          open: previousClose,
          high: previousClose,
          low: previousClose,
          close: previousClose,
          volume: 0,
        });
      }
      previousClose = updatedOhlcvMap.get(intervalStart)?.close ?? previousClose;
    });

    ohlcvMapRef.current = updatedOhlcvMap;
    const ohlcvData = Array.from(updatedOhlcvMap.values()).sort((a, b) => a.time - b.time);
    updateChartData(ohlcvData);
  }, []);

  useEffect(() => {
    processTradeEvents(dataMock.TradeOrderEvent); // TODO: вот тут первый запрос GET_OHLCV_DATA
  }, [processTradeEvents]);

  // useEffect(() => {
  //   processTradeEvents(subscriptionData.TradeOrderEvent, updateData); //TODO: тут сокеты обновляются TRADE_ORDER_EVENT_SUBSCRIPTION
  // }, [subscriptionData]}

  const updateChartData = (ohlcvData: OhlcvData[]) => {
    const candlestickSeries = (chartRef.current as any).candlestickSeries;
    const volumeSeries = (chartRef.current as any).volumeSeries;

    candlestickSeries.setData(ohlcvData);

    const volumeData = ohlcvData.map(({ time, volume, open, close }) => ({
      time,
      value: volume,
      color: close > open ? "#26a69a" : close < open ? "#ef5350" : "#888888",
    }));

    volumeSeries.setData(volumeData);
  };

  return <StyledChart ref={chartContainerRef} />;
};

export default TradingViewWidgetNew;

const StyledChart = styled.div`
  width: "100%";
  height: "100%";
  position: "relative";
`;
