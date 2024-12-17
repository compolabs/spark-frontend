import _ from "lodash";
import { makeAutoObservable, reaction } from "mobx";

import { GetLeaderBoardQueryParams, TraderVolumeResponse } from "@compolabs/spark-orderbook-ts-sdk";

import { FiltersProps } from "@stores/DashboardStore.ts";

import { filters } from "@screens/Dashboard/const";

import { CONFIG } from "@utils/getConfig.ts";

import { FuelNetwork } from "@blockchain";

import RootStore from "./RootStore";

const config = {
  url: CONFIG.APP.sentioUrl,
  apiKey: "TLjw41s3DYbWALbwmvwLDM9vbVEDrD9BP",
};

class LeaderBoardStore {
  initialized = false;
  activeUserStat = 0;
  activeTime = 0;
  page = 1;
  activeFilter = filters[0];
  leaderBoard: TraderVolumeResponse[] = [];
  searchWallet = "";

  constructor(private rootStore: RootStore) {
    const { accountStore } = this.rootStore;
    makeAutoObservable(this);
    this.init();

    reaction(
      () => [this.activeFilter, accountStore.address],
      () => {
        this.fetchLeaderBoard();
      },
    );

    reaction(
      () => [accountStore.isConnected],
      () => {
        if (!accountStore.isConnected) this.disconnect();
      },
    );
  }

  private fetchLeaderBoard = async () => {
    const bcNetwork = FuelNetwork.getInstance();
    const params = {
      page: this.page - 1,
      search: this.searchWallet,
      currentTimestamp: Math.floor(new Date().getTime() / 1000),
      interval: this.activeFilter.value * 3600,
    };
    bcNetwork.setSentioConfig(config);

    const data = await bcNetwork.getLeaderBoard(params);
    const mainData = data?.result?.rows ?? [];

    let finalData = mainData;

    if (this.page === 1) {
      const dataMe = await this.fetchMeLeaderBoard(params);
      if (dataMe.length > 0) {
        finalData = [...dataMe, ...mainData];
      }
    }
    this.leaderBoard = finalData;
  };

  private fetchMeLeaderBoard = async (params: GetLeaderBoardQueryParams) => {
    const { accountStore } = this.rootStore;
    if (!accountStore.address) return [];
    const bcNetwork = FuelNetwork.getInstance();
    params.page = this.page - 1;
    params.search = accountStore.address;
    const data = await bcNetwork.getLeaderBoard(params);
    return data?.result?.rows ?? [];
  };

  public setActivePage = (page: number) => {
    this.page = page;
    this.fetchLeaderBoard();
  };

  public setActiveFilter = (filter: FiltersProps) => {
    this.activeFilter = filter;
  };

  fetchLeaderBoardDebounce = _.debounce(this.fetchLeaderBoard, 250);

  public setSearchWallet = (searchWallet: string) => {
    this.searchWallet = searchWallet;
    this.fetchLeaderBoardDebounce();
  };

  init = async () => {
    this.initialized = true;
    const date = new Date();
    this.fetchLeaderBoard();
    this.activeTime = this.calculateTime(date, 24);
  };

  disconnect = () => {
    this.initialized = false;
    this.activeUserStat = 0;
    this.activeTime = 0;
    this.activeFilter = filters[0];
  };

  calculateTime = (date: Date, range: number) => {
    return Math.floor(date.setHours(date.getHours() - range) / 1000);
  };
}

export default LeaderBoardStore;
