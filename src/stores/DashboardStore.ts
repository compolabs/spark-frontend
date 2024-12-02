import { makeAutoObservable, reaction } from "mobx";

import { filters } from "@screens/Dashboard/const";

import { CONFIG } from "@utils/getConfig";

import { FuelNetwork } from "@blockchain";

import RootStore from "./RootStore";

export interface ISerializedDashboardStore {
  data: string;
}

interface Row {
  block_date: string;
  total_value_locked_score: number;
  tradeVolume: number;
}

export interface FiltersProps {
  title: string;
  value: number;
}

export interface DataPoint {
  time: number;
  value: number;
}

class DashboardStore {
  initialized = false;
  scoreboardData: Row[] = [];
  activeUserStat = 0;
  activeTime = 0;
  activeFilter = filters[0];

  constructor(private rootStore: RootStore) {
    const { accountStore } = this.rootStore;
    makeAutoObservable(this);
    this.init();

    reaction(
      () => [this.activeTime, accountStore.address],
      () => {
        this.fetchUserScoreSnapshot();
      },
    );

    reaction(
      () => [accountStore.isConnected],
      () => {
        if (!accountStore.isConnected) this.disconnect();
      },
    );
  }

  init = async () => {
    this.initialized = true;
    const date = new Date();
    this.calculateTime(date, 24);
    await this.fetchUserScoreSnapshot();
  };

  disconnect = () => {
    this.initialized = false;
    this.scoreboardData = [];
    this.activeUserStat = 0;
    this.activeTime = 0;
    this.activeFilter = filters[0];
  };

  getCumulativeStats = () => {
    return this.scoreboardData.reduce(
      (acc, cur) => {
        acc.total_value_locked_score += cur.total_value_locked_score;
        acc.tradeVolume += cur.tradeVolume;
        return acc;
      },
      { total_value_locked_score: 0, tradeVolume: 0 },
    );
  };

  getChartData = (indexStat: number) => {
    const groupedData = this.scoreboardData.reduce((acc: Record<number, DataPoint>, el) => {
      const date = Math.floor(new Date(el.block_date).getTime() / 1000);
      const value = indexStat === 0 ? el.total_value_locked_score : el.tradeVolume;

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
    this.calculateTime(date, activeFilter.value);
  };

  private calculateTime = (date: Date, range: number) => {
    this.activeTime = Math.floor(date.setHours(date.getHours() - range) / 1000);
  };
  private fetchUserScoreSnapshot = async () => {
    const bcNetwork = FuelNetwork.getInstance();
    const { accountStore } = this.rootStore;
    if (!accountStore?.address) return;
    const params = {
      userAddress: accountStore.address,
      blockDate: this.activeTime,
    };
    const config = {
      url: CONFIG.APP.sentioUrl,
      apiKey: "TLjw41s3DYbWALbwmvwLDM9vbVEDrD9BP",
    };
    bcNetwork.setSentioConfig(config);
    const data = await bcNetwork.getUserScoreSnapshot(params);
    this.scoreboardData = data?.result?.rows ?? [];
  };
}

export default DashboardStore;
