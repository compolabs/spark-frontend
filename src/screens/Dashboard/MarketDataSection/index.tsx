import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";

import { useStores } from "@stores";

import { MarketDataCard } from "./MarketDataCard";

const marketData = [
  {
    title: "Portfolio Value",
    value: "$0",
    period: "24h",
    change: {
      value: "+0",
      percentage: "0",
      direction: "up",
    },
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
  },
];

interface generateStatsProps {
  total_value_locked_score: number;
  tradeVolume: number;
}

export const MarketDataSection: React.FC = observer(() => {
  const [userStats, setUserStats] = useState(marketData);
  const { dashboardStore } = useStores();

  useEffect(() => {
    const sumStatsUser = dashboardStore.getCumulativeStats();
    console.log("dashboardStore", dashboardStore.scoreboardData);
    if (dashboardStore.scoreboardData.length < 1) return;
    console.log("123");
    setUserStats((prev) => {
      prev[0].value = `$${sumStatsUser.total_value_locked_score.toFixed(4)}`;
      prev[1].value = `$${sumStatsUser.tradeVolume.toFixed(4)}`;
      const calculateChange = (initialIndex: number, finalIndex: number, property: keyof generateStatsProps) => {
        const initialData = dashboardStore.scoreboardData[initialIndex];
        const finalData = dashboardStore.scoreboardData[finalIndex];
        const difference = finalData[property] - initialData[property];
        const percentageChange = (difference / initialData[property]) * 100;
        const direction = difference < 0 ? "down" : "up";
        return {
          value: `${difference < 0 ? "-" : "+"}${Math.abs(difference).toFixed(4)}`,
          percentage: `${percentageChange.toFixed(2)}%`,
          direction: direction as string,
        };
      };
      prev[0].change = calculateChange(0, dashboardStore.scoreboardData.length - 1, "total_value_locked_score");
      prev[1].change = calculateChange(1, dashboardStore.scoreboardData.length - 1, "tradeVolume");
      prev[0].period = dashboardStore.activeFilter.title;
      prev[1].period = dashboardStore.activeFilter.title;
      return [...userStats];
    });
  }, [dashboardStore.scoreboardData]);

  return <MarketDataCard attributes={userStats} />;
});