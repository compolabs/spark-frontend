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
  const [userStats, setUserStats] = useState(() => structuredClone(marketData));
  const { dashboardStore } = useStores();

  useEffect(() => {
    if (dashboardStore.scoreboardData.length === 0) {
      setUserStats(structuredClone(marketData));
      return;
    }

    const sumStatsUser = dashboardStore.scoreboardData[dashboardStore.scoreboardData.length - 1];
    const updatedStats = structuredClone(marketData); // Глубокое клонирование начальных данных

    updatedStats[0].period = dashboardStore.activeFilter.description ?? dashboardStore.activeFilter.title;
    updatedStats[1].period = dashboardStore.activeFilter.description ?? dashboardStore.activeFilter.title;

    updatedStats[0].value = `$${sumStatsUser.total_value_locked_score.toFixed(4)}`;
    updatedStats[1].value = `$${sumStatsUser.tradeVolume.toFixed(4)}`;

    const calculateChange = (initialIndex: number, finalIndex: number, property: keyof generateStatsProps) => {
      const initialData = dashboardStore.scoreboardData[initialIndex];
      const finalData = dashboardStore.scoreboardData[finalIndex];
      const difference = finalData[property] - initialData[property];
      const percentageChange = (difference / initialData[property]) * 100;
      const direction = difference < 0 ? "down" : "up";
      return {
        value: `${difference < 0 ? "-" : "+"}${Math.abs(difference).toFixed(4)}`,
        percentage: `${percentageChange.toFixed(2)}%`,
        direction,
      };
    };

    updatedStats[0].change = calculateChange(0, dashboardStore.scoreboardData.length - 1, "total_value_locked_score");
    updatedStats[1].change = calculateChange(0, dashboardStore.scoreboardData.length - 1, "tradeVolume");

    setUserStats(updatedStats);
  }, [dashboardStore.scoreboardData, dashboardStore.activeFilter]);

  return <MarketDataCard attributes={userStats} />;
});
