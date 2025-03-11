import { makeAutoObservable, reaction } from "mobx";

import { BalancePnlByUserResponse, RowSnapshot, RowTradeEvent } from "@compolabs/spark-orderbook-ts-sdk";

import { filters } from "@screens/Dashboard/const";
import { TradeEvent } from "@screens/Dashboard/InfoDataGraph";

import { CONFIG } from "@utils/getConfig";
import { IntervalUpdater } from "@utils/IntervalUpdater";

import { FuelNetwork } from "@blockchain";

import RootStore from "./RootStore";

interface IRecord {
  user: string;
  market: string;
  tvl: number;
  timestamp: number;
}

type SummedBalancePnl = {
  [key: string]: string;
};

export interface FiltersProps {
  title: string;
  value: number;
}

export interface DataPoint {
  time: number;
  value: number;
}

const UPDATE_INTERVAL = 10000; // 10 sec

class DashboardStore {
  initialized = false;
  rowSnapshots: RowSnapshot[] = [];
  tradeEvents: RowTradeEvent[] = [];
  balancePnlByUser: BalancePnlByUserResponse[] = [];
  activeUserStat = 0;
  activeTime = 0;
  activeFilter = filters[0];

  private syncDashboardDataUpdater: IntervalUpdater;

  constructor(private rootStore: RootStore) {
    const { accountStore } = this.rootStore;
    makeAutoObservable(this);
    this.init();

    this.syncDashboardDataUpdater = new IntervalUpdater(this.syncDashboardData, UPDATE_INTERVAL);

    reaction(
      () => [this.activeTime, accountStore.address],
      () => {
        this.syncDashboardData();
      },
    );

    reaction(
      () => [accountStore.isConnected],
      () => {
        if (!accountStore.isConnected) this.disconnect();
      },
    );

    this.syncDashboardDataUpdater.run();
  }

  init = async () => {
    this.initialized = true;
    const date = new Date();
    this.activeTime = this.calculateTime(date, 24);
    await this.fetchUserScoreSnapshot();
    await this.fetchTradeEvent();
    await this.fetchBalancePnl();
  };

  disconnect = () => {
    this.initialized = false;
    this.rowSnapshots = [];
    this.activeUserStat = 0;
    this.activeTime = 0;
    this.activeFilter = filters[0];
  };

  private syncDashboardData = async () => {
    await this.fetchUserScoreSnapshot();
    await this.fetchTradeEvent();
    await this.fetchBalancePnl();
  };

  getPnlValues = (pnlData: SummedBalancePnl) => {
    switch (this.activeFilter.title) {
      case "24h":
        return { pnl: pnlData.pnl1, pnlInPercent: pnlData.pnlInPersent1 };
      case "7d":
        return { pnl: pnlData.pnl7, pnlInPercent: pnlData.pnlInPersent7 };
      case "30d":
        return { pnl: pnlData.pnl31, pnlInPercent: pnlData.pnlInPersent31 };
      case "All Time":
        return { pnl: pnlData.pnlAllTime, pnlInPercent: pnlData.pnlInPersentAllTime };
      default:
        return null;
    }
  };
  get totalPnl() {
    const summedValues: SummedBalancePnl | any = {};
    this.balancePnlByUser.forEach((entry) => {
      Object.keys(entry).forEach((key) => {
        if (key !== "market") {
          const currentValue = summedValues[key] || "0";
          const newValue = entry[key as keyof BalancePnlByUserResponse] as string;
          summedValues[key] = Number(currentValue) + Number(newValue);
        }
      });
    });

    return this.getPnlValues(summedValues);
  }

  getChartDataPortfolio = () => {
    const result: TradeEvent[] = [];
    const lastValues: { [market: string]: { tvl: number; timestamp: number } } = {};

    this.rowSnapshots.forEach((hourData) => {
      const { hour, records_in_hour } = hourData;
      const currentHourValues: { [market: string]: { tvl: number; timestamp: number } } = {};
      records_in_hour.forEach((record) => {
        const { market, tvl, timestamp }: IRecord = JSON.parse(record);
        if (!currentHourValues[market] || currentHourValues[market].timestamp < timestamp) {
          currentHourValues[market] = { tvl, timestamp };
        }
      });

      let accumulatedValue = 0;
      Object.keys(currentHourValues).forEach((market) => {
        accumulatedValue += currentHourValues[market].tvl;
        lastValues[market] = currentHourValues[market];
      });
      result.push({
        time: Math.floor(new Date(hour).getTime() / 1000),
        value: accumulatedValue,
      });
    });

    return result;
  };

  getChartDataTrading = () => {
    const groupedData = this.tradeEvents.reduce((acc: Record<number, DataPoint>, el) => {
      const date = Math.floor(new Date(el.timestamp).getTime());
      const value = el.volume;

      if (!acc[date]) {
        acc[date] = { time: date, value: 0 };
      }
      acc[date].value += value;

      return acc;
    }, {});

    return Object.values(groupedData);
  };

  setActiveUserStat = (index: number) => {
    this.activeUserStat = index;
  };

  setActiveTime = (activeFilter: FiltersProps) => {
    const date = new Date();
    this.activeFilter = activeFilter;
    this.activeTime = this.calculateTime(date, activeFilter.value);
  };

  calculateTime = (date: Date, range: number) => {
    return Math.floor(date.setHours(date.getHours() - range) / 1000);
  };

  private fetchUserScoreSnapshot = async () => {
    const bcNetwork = FuelNetwork.getInstance();
    const { accountStore } = this.rootStore;
    if (!accountStore?.address) return;
    const params = {
      userAddress: accountStore.address,
      fromTimestamp: this.activeTime,
      toTimestamp: this.calculateTime(new Date(), 0),
    };
    const config = {
      url: CONFIG.APP.sentioUrl,
      apiKey: "TLjw41s3DYbWALbwmvwLDM9vbVEDrD9BP",
    };
    bcNetwork.setSentioConfig(config);
    const data = await bcNetwork.getUserScoreSnapshot(params);
    this.rowSnapshots = data?.result?.rows ?? [];
  };

  private fetchTradeEvent = async () => {
    const bcNetwork = FuelNetwork.getInstance();
    const { accountStore } = this.rootStore;
    if (!accountStore?.address) return;
    const params = {
      userAddress: accountStore.address,
      fromTimestamp: this.activeTime,
      toTimestamp: this.calculateTime(new Date(), 0),
    };
    const config = {
      url: CONFIG.APP.sentioUrl,
      apiKey: "TLjw41s3DYbWALbwmvwLDM9vbVEDrD9BP",
    };
    bcNetwork.setSentioConfig(config);
    const data = await bcNetwork.getTradeEvent(params);
    this.tradeEvents = data?.result?.rows ?? [];
  };

  private fetchBalancePnl = async () => {
    const bcNetwork = FuelNetwork.getInstance();
    const { accountStore } = this.rootStore;
    if (!accountStore?.address) return;
    const params = {
      user: accountStore.address,
    };
    const config = {
      url: CONFIG.APP.sentioUrl,
      apiKey: "TLjw41s3DYbWALbwmvwLDM9vbVEDrD9BP",
    };
    bcNetwork.setSentioConfig(config);
    const data = await bcNetwork.fetchBalancePnl(params);
    this.balancePnlByUser = data?.result?.rows ?? [];
  };
}

export default DashboardStore;
