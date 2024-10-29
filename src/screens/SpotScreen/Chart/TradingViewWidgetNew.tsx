import React, { useCallback, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { createChart, IChartApi } from "lightweight-charts";
import { observer } from "mobx-react-lite";

import { useStores } from "@stores";

import { candlestickSeriesConfig, chartConfig, histogramConfig } from "@screens/SpotScreen/Chart/configChart";

const TradingViewWidgetNew: React.FC = observer(() => {
  const { spotOrderBookStore } = useStores();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // TODO: сюда useState с data которая приходит
  const initializeChart = useCallback(() => {
    // TODO: не уверен что нужен callback
    if (chartContainerRef.current && !chartRef.current) {
      const newChart = createChart(chartContainerRef.current, chartConfig);
      chartRef.current = newChart;

      // Создаем candlestick и volume серии
      const candlestickSeries = newChart.addCandlestickSeries(candlestickSeriesConfig);
      const histogramSeries = newChart.addHistogramSeries(histogramConfig);

      // Применяем параметры для volume серии
      histogramSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });

      // Сохраняем ссылки на серии
      chartRef.current = {
        chartInstance: newChart,
        candlestickSeries,
        volumeSeries: histogramSeries,
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

  useEffect(() => {
    const candlestickSeries = (chartRef.current as any).candlestickSeries;
    const volumeSeries = (chartRef.current as any).volumeSeries;

    if (candlestickSeries && volumeSeries) {
      if (spotOrderBookStore.ohlcvData.length) {
        candlestickSeries.setData(spotOrderBookStore.ohlcvData);
      }
      if (spotOrderBookStore.historgramData.length) {
        volumeSeries.setData(spotOrderBookStore.historgramData);
      }
    }
  }, [spotOrderBookStore.ohlcvData, spotOrderBookStore.historgramData]);

  return <StyledChart ref={chartContainerRef} />;
});

export default TradingViewWidgetNew;

const StyledChart = styled.div`
  width: "100%";
  height: "100%";
  position: "relative";
`;
