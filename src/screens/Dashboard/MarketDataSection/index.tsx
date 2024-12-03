import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";

import { useStores } from "@stores";
import { DataPoint } from "@stores/DashboardStore";

import { MarketDataCard } from "./MarketDataCard";

const marketData = [
  {
    title: "Balance Value",
    value: "$0",
    period: "24h",
    change: {
      value: "+0",
      percentage: "0",
      direction: "up",
    },
    isShowDetails: true,
  },
  {
    title: "Trading Volume",
    value: "$0",
    period: "24h",
    change: {
      value: "+0",
      percentage: "0",
      direction: "up",
    },
    isShowDetails: false,
  },
];

export const MarketDataSection: React.FC = observer(() => {
  const [userStats, setUserStats] = useState(() => structuredClone(marketData));
  const { dashboardStore } = useStores();
  const portfolioVolume = dashboardStore.getChartDataPortfolio();
  const tradingVolume = dashboardStore.getChartDataTrading();
  useEffect(() => {
    if (dashboardStore.rowSnapshots.length === 0) {
      setUserStats(structuredClone(marketData));
      return;
    }

    const sumStatsUser = portfolioVolume[portfolioVolume.length - 1];
    const sumStatsTrading = tradingVolume[tradingVolume.length - 1];
    const updatedStats = structuredClone(marketData);

    updatedStats[0].period = dashboardStore.activeFilter.description ?? dashboardStore.activeFilter.title;
    updatedStats[1].period = dashboardStore.activeFilter.description ?? dashboardStore.activeFilter.title;

    updatedStats[0].value = `$${sumStatsUser.value.toFixed(4)}`;
    updatedStats[1].value = `$${sumStatsTrading?.value?.toFixed(4) ?? "0.0000"}`;
    const calculateChange = (data: DataPoint[]) => {
      if (data.length === 0) {
        return {
          value: "0",
          percentage: "0",
          direction: "up",
        };
      }
      const initialData = data[0];
      const finalData = data[data.length - 1] ?? 0;
      const difference = finalData?.value - initialData?.value;
      const percentageChange = finalData.value === 0 ? 100 : (difference / finalData.value) * 100;
      const direction = difference < 0 ? "down" : "up";
      return {
        value: `${difference < 0 ? "-" : "+"}${Math.abs(difference).toFixed(4)}`,
        percentage: `${percentageChange.toFixed(2)}%`,
        direction,
      };
    };
    updatedStats[0].change = calculateChange(portfolioVolume);
    updatedStats[1].change = calculateChange(tradingVolume);
    setUserStats(updatedStats);
  }, [dashboardStore.rowSnapshots, dashboardStore.activeFilter, dashboardStore.tradeEvents]);

  return <MarketDataCard attributes={userStats} />;
});
