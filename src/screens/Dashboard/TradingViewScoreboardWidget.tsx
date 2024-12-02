import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { createChart, IChartApi } from "lightweight-charts";
import { observer } from "mobx-react-lite";

interface ChartDataProps {
  time: number;
  value: number;
}

interface TradingViewScoreboardWidgetProps {
  data: ChartDataProps[];
}

const TradingViewScoreboardWidget: React.FC<TradingViewScoreboardWidgetProps> = observer(({ data }: any) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null); // Сохраняем ссылку на график
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        setContainerDimensions({
          width: chartContainerRef.current.offsetWidth,
          height: chartContainerRef.current.offsetHeight,
        });
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current || containerDimensions.width === 0 || containerDimensions.height === 0) return;

    // Если график уже существует, обновляем его размеры
    if (chartRef.current) {
      chartRef.current.resize(containerDimensions.width, containerDimensions.height);
    } else {
      // Создаем новый график
      const chart = createChart(chartContainerRef.current, {
        width: containerDimensions.width,
        height: containerDimensions.height,
      });

      chart.applyOptions({
        layout: {
          background: {
            color: "#141414",
          },
          textColor: "white",
        },
        grid: {
          vertLines: {
            color: "rgba(255, 255, 255, 0.2)",
          },
          horzLines: {
            color: "rgba(255, 255, 255, 0.2)",
          },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartRef.current = chart;

      const areaSeries = chart.addAreaSeries({
        topColor: "rgba(4, 231, 140, 0.4)",
        bottomColor: "rgba(4, 231, 140, 0.1)",
        lineColor: "#04E78C",
        lineWidth: 2,
      });
      areaSeries.setData(data);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, containerDimensions]);

  return (
    <Root>
      <div ref={chartContainerRef} />
    </Root>
  );
});

export default TradingViewScoreboardWidget;

const Root = styled.div`
  width: 100%;
  height: 100%;
  min-height: 200px;
  & > div {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }

  .tv-lightweight-charts {
    border: 1px solid rgba(46, 46, 46, 1);
    margin: -2px -2px -2px;
    height: calc(100% - 2px) !important;
    width: calc(100% - 2px) !important;
    border-radius: 8px;
  }
`;
