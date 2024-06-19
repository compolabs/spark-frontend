import React, { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { observer } from "mobx-react";

import Loader from "@src/components/Loader";
import { PerpMarket, SpotMarket } from "@src/entity";
import { useMedia } from "@src/hooks/useMedia";
import { CreateOrderVMProvider } from "@src/screens/TradeScreen/RightBlock/CreateOrder/CreateOrderVM";
import { useStores } from "@stores";

import TradeScreenDesktop from "./TradeScreenDesktop";
import TradeScreenMobile from "./TradeScreenMobile";

const TradeScreenImpl: React.FC = observer(() => {
  const { tradeStore } = useStores();
  const media = useMedia();

  useEffect(() => {
    document.title = `Spark | ${tradeStore.marketSymbol}`;
  }, [tradeStore.marketSymbol]);

  return media.mobile ? <TradeScreenMobile /> : <TradeScreenDesktop />;
});

const TradeScreen: React.FC = observer(() => {
  const { tradeStore } = useStores();
  const location = useLocation();
  const { marketId } = useParams<{ marketId: string }>();

  const isPerp = location.pathname.includes("PERP");

  const isMarketExists = (markets: SpotMarket[] | PerpMarket[]) => markets.some((market) => market.symbol === marketId);

  const spotMarketExists = isMarketExists(tradeStore.spotMarkets);
  const perpMarketExists = isMarketExists(tradeStore.perpMarkets);

  if (!tradeStore.initialized) {
    return <Loader />;
  }

  const selectedMarket = !marketId
    ? tradeStore.defaultMarketSymbol
    : spotMarketExists
      ? marketId
      : perpMarketExists
        ? marketId
        : tradeStore.defaultMarketSymbol;

  tradeStore.setIsPerp(isPerp && tradeStore.isPerpAvailable);
  tradeStore.setMarketSymbol(selectedMarket);

  return (
    // TradeScreenImpl оборачивается в CreateOrderSpotVMProvider чтобы при нажатии на ордер в OrderbookAndTradesInterface устанавливать значение в RightBlock
    <CreateOrderVMProvider>
      <TradeScreenImpl />
    </CreateOrderVMProvider>
  );
});

export default TradeScreen;
