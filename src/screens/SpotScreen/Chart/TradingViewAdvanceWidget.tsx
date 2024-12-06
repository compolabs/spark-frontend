import React, { useEffect, useRef } from "react";

import { ChartingLibraryWidgetOptions, LanguageCode, ResolutionString, widget } from "@compolabs/tradingview-chart";

import { useStores } from "@stores";

// @ts-ignore
import("@compolabs/tradingview-chart/dist/bundle").then((module) => {
  window.Datafeeds = module;
});

export interface ChartContainerProps {
  symbol: ChartingLibraryWidgetOptions["symbol"];
  interval: ChartingLibraryWidgetOptions["interval"];

  // BEWARE: no trailing slash is expected in feed URL
  datafeedUrl: string;
  libraryPath: ChartingLibraryWidgetOptions["library_path"];
  chartsStorageUrl: ChartingLibraryWidgetOptions["charts_storage_url"];
  chartsStorageApiVersion: ChartingLibraryWidgetOptions["charts_storage_api_version"];
  clientId: ChartingLibraryWidgetOptions["client_id"];
  userId: ChartingLibraryWidgetOptions["user_id"];
  fullscreen: ChartingLibraryWidgetOptions["fullscreen"];
  autosize: ChartingLibraryWidgetOptions["autosize"];
  studiesOverrides: ChartingLibraryWidgetOptions["studies_overrides"];
  container: ChartingLibraryWidgetOptions["container"];
}

const getLanguageFromURL = (): LanguageCode | null => {
  const regex = new RegExp("[\\?&]lang=([^&#]*)");
  const results = regex.exec(location.search);
  return results === null ? null : (decodeURIComponent(results[1].replace(/\+/g, " ")) as LanguageCode);
};

const TradingViewChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
  const { tradeStore } = useStores();

  console.log("tradeStore", tradeStore.market?.symbol.replace("-", ""));
  const defaultProps: Omit<ChartContainerProps, "container"> = {
    symbol: tradeStore.market?.symbol.replace("-", ""),
    interval: "D" as ResolutionString,
    datafeedUrl: "https://spark-candles.staging.sprk.fi",
    libraryPath: "/charting_library/",
    chartsStorageUrl: "https://saveload.tradingview.com",
    chartsStorageApiVersion: "1.1",
    clientId: "tradingview.com",
    userId: "public_user_id",
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
  };

  useEffect(() => {
    console.log("window", window?.Datafeeds);
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: defaultProps.symbol as string,
      // BEWARE: no trailing slash is expected in feed URL
      // tslint:disable-next-line:no-any
      datafeed: new window.Datafeeds.UDFCompatibleDatafeed(defaultProps.datafeedUrl),
      interval: defaultProps.interval as ChartingLibraryWidgetOptions["interval"],
      container: chartContainerRef.current,
      library_path: defaultProps.libraryPath as string,
      theme: "dark",
      locale: getLanguageFromURL() || "en",
      disabled_features: ["use_localstorage_for_settings"],
      enabled_features: ["study_templates"],
      charts_storage_url: defaultProps.chartsStorageUrl,
      charts_storage_api_version: defaultProps.chartsStorageApiVersion,
      client_id: defaultProps.clientId,
      user_id: defaultProps.userId,
      fullscreen: defaultProps.fullscreen,
      autosize: defaultProps.autosize,
      studies_overrides: defaultProps.studiesOverrides,
    };

    const tvWidget = new widget(widgetOptions);

    return () => {
      tvWidget.remove();
    };
  }, [tradeStore?.market]);

  return <div ref={chartContainerRef} className="TVChartContainer" />;
};

export default TradingViewChart;
