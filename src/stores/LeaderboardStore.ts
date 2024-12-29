import _ from "lodash";
import { makeAutoObservable, reaction } from "mobx";

import { GetLeaderboardQueryParams, TraderVolumeResponse } from "@compolabs/spark-orderbook-ts-sdk";

import { FiltersProps } from "@stores/DashboardStore";

import { filters } from "@screens/Dashboard/const";

import { CONFIG } from "@utils/getConfig";

import { FuelNetwork } from "@blockchain";

import RootStore from "./RootStore";

const config = {
  url: CONFIG.APP.links.sentioUrl,
  apiKey: "TLjw41s3DYbWALbwmvwLDM9vbVEDrD9BP",
};

export interface PaginationProps {
  title: string;
  key: number;
}

export const PAGINATION_PER_PAGE: PaginationProps[] = [
  { title: "10", key: 10 },
  { title: "25", key: 25 },
  { title: "50", key: 50 },
  { title: "100", key: 100 },
];

export class LeaderboardStore {
  initialized = false;
  activeUserStat = 0;
  activeTime = 0;
  page = 1;
  activeFilter = filters[0];
  leaderboard: TraderVolumeResponse[] = [];
  searchWallet = "";
  orderPerPage: PaginationProps = PAGINATION_PER_PAGE[0];

  constructor(private rootStore: RootStore) {
    const { accountStore } = this.rootStore;
    makeAutoObservable(this);
    this.init();

    reaction(
      () => [this.activeFilter, accountStore.address, this.searchWallet, this.orderPerPage],
      () => {
        this.page = 1;
        this.fetchLeaderboard();
      },
    );

    reaction(
      () => [accountStore.isConnected],
      () => {
        if (!accountStore.isConnected) this.disconnect();
      },
    );
  }

  private shortenAddress = (address: string, chars = 4) => {
    if (!address) return "";
    const prefix = address.slice(0, 2); // '0x'
    const start = address.slice(2, 2 + chars); // первые 4 символа
    const end = address.slice(-chars); // последние 4 символа
    return `${prefix}${start}...${end}`;
  };

  private fetchLeaderboard = async () => {
    const bcNetwork = FuelNetwork.getInstance();
    const params = {
      limit: this.orderPerPage.key,
      page: this.page - 1,
      search: this.searchWallet,
      currentTimestamp: Math.floor(new Date().getTime() / 1000),
      interval: this.activeFilter.value * 3600,
    };
    bcNetwork.setSpotSentioConfig(config);

    const data = await bcNetwork.getLeaderboard(params);
    const mainData = data?.result?.rows ?? [];

    let finalData = mainData;

    if (this.page === 1) {
      const dataMe = await this.fetchMeLeaderboard(params);
      if (dataMe.length > 0) {
        finalData = [...dataMe, ...mainData];
      }
    }
    this.leaderboard = finalData.map((el) => ({
      ...el,
      walletId: this.shortenAddress(el.walletId),
    }));
  };

  private fetchMeLeaderboard = async (params: GetLeaderboardQueryParams) => {
    const { accountStore } = this.rootStore;
    if (!accountStore.address) return [];
    const bcNetwork = FuelNetwork.getInstance();
    params.page = this.page - 1;
    params.search = accountStore.address;
    const data = await bcNetwork.getLeaderboard(params);
    let meData = data?.result?.rows[0] ?? null;
    const meDataMock: TraderVolumeResponse = {
      walletId: accountStore.address,
      traderVolume: 0,
      id: "N/A",
      totalCount: 0,
      isYour: true,
    };
    if (meData) {
      meDataMock.id = (meData?.id as number) > 100 ? "+100" : (meData.id as number);
    } else {
      meData = meDataMock;
    }

    return [meData];
  };

  public setActivePage = (page: number) => {
    this.page = page;
    this.fetchLeaderboard();
  };

  public setActiveFilter = (filter: FiltersProps) => {
    this.activeFilter = filter;
  };

  public setOrderPerPage = (page: PaginationProps) => {
    this.orderPerPage = page;
  };

  fetchLeaderboardDebounce = _.debounce(this.fetchLeaderboard, 250);

  public setSearchWallet = (searchWallet: string) => {
    this.searchWallet = searchWallet;
    this.fetchLeaderboardDebounce();
  };

  get maxTotalCount() {
    return this.leaderboard.reduce((max, item) => {
      return item?.totalCount > max ? item.totalCount : max;
    }, 0);
  }

  init = async () => {
    this.initialized = true;
    const date = new Date();
    this.fetchLeaderboard();
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
