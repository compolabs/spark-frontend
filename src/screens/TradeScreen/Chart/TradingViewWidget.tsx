import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Loader from "@src/components/Loader";
import { useStores } from "@stores";

const tvScriptLoadingPromise = () =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.id = "tradingview-widget-loading-script";
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.onload = resolve;

    document.head.appendChild(script);
  });

const TRADING_VIEW_ID = "tradingview_chart_container";

const CHART_CHECK_INTERVAL = 1000;

const TradingViewWidget = observer(() => {
  const [isLoading, setIsLoading] = useState(true);
  const isScriptInjected = useRef(false);
  const widgetRef = useRef<any>();

  const theme = useTheme();
  const { tradeStore } = useStores();

  const createWidget = () => {
    const { market } = tradeStore;
    const tradingViewContainer = document.getElementById(TRADING_VIEW_ID);
    const isTradingViewAvailable = "TradingView" in window;

    if (!market || !tradingViewContainer || !isTradingViewAvailable) {
      return;
    }

    const symbol = `OKX:${market.baseToken.symbol}${market.quoteToken.symbol}`;
    const widgetConfig = {
      autosize: true,
      symbol,
      interval: "30",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      backgroundColor: theme.colors.bgPrimary,
      gridColor: theme.colors.borderSecondary,
      hide_top_toolbar: true,
      hide_legend: false,
      save_image: false,
      container_id: TRADING_VIEW_ID,
    };

    widgetRef.current = new (window as any).TradingView.widget(widgetConfig);
  };

  useLayoutEffect(() => {
    if (isScriptInjected.current) return;

    tvScriptLoadingPromise().then(createWidget);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!widgetRef.current?._ready) return;

      setIsLoading(false);
      clearInterval(intervalId);
    }, CHART_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Root className="tradingview-widget-container">
      {isLoading && <Loader hideText />}
      <div id={TRADING_VIEW_ID} />
    </Root>
  );
});

export default TradingViewWidget;

const Root = styled.div`
  height: 100%;
  width: 100%;
  overflow: hidden;

  & > div {
    margin: -2px 0 0 -2px;
    height: calc(100% + 4px);
    width: calc(100% + 4px);
  }
`;
