import React from "react";
import { observer } from "mobx-react-lite";

import { useStores } from "@stores";

import TradingViewScoreboardWidget from "@screens/Dashboard/TradingViewScoreboardWidget";

const InfoDataGraph: React.FC = observer(() => {
  const { dashboardStore } = useStores();
  return <TradingViewScoreboardWidget data={dashboardStore.getChartData()} />;
});

export default InfoDataGraph;
