import { HistogramSeriesPartialOptions } from "lightweight-charts";

export const chartConfig = {
  autoSize: true,
  layout: {
    background: { color: "#000000" }, // Corrected: Use an object with 'color'
    textColor: "#c9c9c9",
  },
  grid: {
    vertLines: {
      color: "#333333",
    },
    horzLines: {
      color: "#333333",
    },
  },
  timeScale: {
    timeVisible: true,
    secondsVisible: false, // Hide seconds for cleaner labels
    borderVisible: true,
    borderColor: "#c9c9c9",
  },
};

export const candlestickSeriesConfig = {
  upColor: "#26a69a",
  downColor: "#ef5350",
  borderUpColor: "#26a69a",
  borderDownColor: "#ef5350",
  wickUpColor: "#26a69a",
  wickDownColor: "#ef5350",
};

export const histogramConfig: HistogramSeriesPartialOptions = {
  priceFormat: {
    type: "volume",
  },
  priceScaleId: "",
  color: "#26a69a",
  priceLineVisible: false,
  lastValueVisible: false,
};
