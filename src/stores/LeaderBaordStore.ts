import { makeAutoObservable, reaction } from "mobx";

import { filters } from "@screens/Dashboard/const";

import RootStore from "./RootStore";
import { FuelNetwork } from "@blockchain";
import { CONFIG } from "@utils/getConfig.ts";
import { TraderVolume } from "../../../spark-orderbook-ts-sdk/src";

const config = {
  url: CONFIG.APP.sentioUrl,
  apiKey: "TLjw41s3DYbWALbwmvwLDM9vbVEDrD9BP",
};

class LeaderBoardStore {
  initialized = false;
  activeUserStat = 0;
  activeTime = 0;
  activeFilter = filters[0];
  leaderBoard: TraderVolume[] = []

  constructor(private rootStore: RootStore) {
    const { accountStore } = this.rootStore;
    makeAutoObservable(this);
    this.init();

    reaction(
      () => [this.activeTime, accountStore.address],
      () => {
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
      page: 0
    };
    bcNetwork.setSentioConfig(config);
    const data = await bcNetwork.getLeaderBoard(params);
    console.log(data?.result?.rows);
    this.leaderBoard = data?.result?.rows ?? [];
  };

  init = async () => {
    this.initialized = true;
    const date = new Date();
    this.fetchLeaderBoard()
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
