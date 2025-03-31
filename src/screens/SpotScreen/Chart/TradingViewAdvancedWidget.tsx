import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFlag } from "@unleash/proxy-client-react";
import { observer } from "mobx-react";

import { ChartingLibraryWidgetOptions, LanguageCode, ResolutionString, widget } from "@compolabs/tradingview-chart";

import { Blockchain } from "@blockchain";

import { useStores } from "@stores";
import { MIXPANEL_EVENTS } from "@stores/MixPanelStore";

import { ROUTES } from "@constants";

import { Token } from "@entity";
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

function splitPairAndGetTokens(tokens: Token[], pair: string) {
  const baseToken = tokens.find((token) => pair.startsWith(token.symbol));
  if (!baseToken) {
    throw new Error(`Base token not found for pair: ${pair}`);
  }

  const quoteToken = tokens.find((token) => pair.endsWith(token.symbol));
  if (!quoteToken) {
    throw new Error(`Quote token not found for pair: ${pair}`);
  }

  return { baseToken, quoteToken };
}

const getLanguageFromURL = (): LanguageCode | null => {
  const regex = new RegExp("[\\?&]lang=([^&#]*)");
  const results = regex.exec(location.search);
  return results === null ? null : (decodeURIComponent(results[1].replace(/\+/g, " ")) as LanguageCode);
};

const TradingViewChartAdvanced = observer(() => {
  const isUnderConstruction = useFlag("Trading_view_advance_stagging_");
  // const isUnderConstruction = false;

  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
  const { tradeStore, mixPanelStore, accountStore } = useStores();
  const bcNetwork = Blockchain.getInstance();
  const navigate = useNavigate();
  const defaultProps: Omit<ChartContainerProps, "container"> = {
    symbol: tradeStore.market?.symbol.replace("-", ""),
    interval: "D" as ResolutionString,
    datafeedUrl: isUnderConstruction ? "https://spark-candles.v12.trade" : "https://spark-candles.v12.trade", // После переезда 2 домен не сделали, если не появиться, можно убрать и удалить фича-флаг
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
    if (!window?.Datafeeds) return;
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: defaultProps.symbol as string,
      datafeed: new window.Datafeeds.UDFCompatibleDatafeed(defaultProps.datafeedUrl),
      interval: "H" as ResolutionString,
      container: chartContainerRef.current,
      library_path: defaultProps.libraryPath as string,
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
      custom_css_url: "css/style.css",
      loading_screen: {
        backgroundColor: "#141414",
      },
      theme: "dark",
      overrides: {
        "paneProperties.background": "#141414",
        "paneProperties.backgroundType": "solid",
      },
    };

    const tvWidget = new widget(widgetOptions);

    tvWidget.onChartReady(() => {
      const chart = tvWidget.activeChart();
      if (chart) {
        chart.onSymbolChanged().subscribe(null, () => {
          const tokenList = bcNetwork.sdk.getTokenList();
          const { baseToken, quoteToken } = splitPairAndGetTokens(tokenList, chart.symbol());
          mixPanelStore.trackEvent(MIXPANEL_EVENTS.CLICK_CURRENCY_PAIR, {
            user_address: accountStore.address,
            token1: baseToken.symbol,
            token2: quoteToken.symbol,
          });
          tradeStore.setMarketSelectionOpened(false);
          navigate(`${ROUTES.SPOT}/${baseToken.symbol}-${quoteToken.symbol}`);
        });
      }
    });

    return () => {
      tvWidget.remove();
    };
  }, [tradeStore?.market]);
  return <div ref={chartContainerRef} className="TVChartContainer" />;
});

export default TradingViewChartAdvanced;
