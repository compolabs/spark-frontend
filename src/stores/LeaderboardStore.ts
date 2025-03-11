import _ from "lodash";
import { makeAutoObservable, reaction } from "mobx";

import {
  GetCompetitionResponse,
  GetSortedLeaderboardQueryParams,
  GetTotalStatsTableData,
  LeaderboardPnlResponse,
  TraderVolumeResponse,
} from "@compolabs/spark-orderbook-ts-sdk";

import { FiltersProps } from "@stores/DashboardStore";

import { filters, pnlTimeline } from "@screens/Dashboard/const";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";
import { CONFIG } from "@utils/getConfig";

import { FuelNetwork } from "@blockchain";

import setting from "../screens/Competitions/setting.json";

import RootStore from "./RootStore";

const config = {
  url: CONFIG.APP.sentioUrl,
  apiKey: "9mp9ZQtdiQifjttQ6xy8ZmUcMfh6TNlz7",
};

export interface PaginationProps {
  title: string;
  key: number;
}

interface UserPoints {
  points: BN;
  usd: BN;
}

export const PAGINATION_PER_PAGE: PaginationProps[] = [
  { title: "10", key: 10 },
  { title: "25", key: 25 },
  { title: "50", key: 50 },
  { title: "100", key: 100 },
];

class LeaderboardStore {
  initialized = false;
  activeUserStat = 0;
  activeTime = 0;
  page = 1;
  activeFilter = filters[0];
  leaderboard: TraderVolumeResponse[] = [];
  leaderboardPnl: LeaderboardPnlResponse[] = [];
  searchWallet = "";
  orderPerPage: PaginationProps = PAGINATION_PER_PAGE[0];
  sortLeaderboard = {
    field: "volume",
    side: "DESC",
  };
  sortCompetitions = {
    field: "pnl",
    side: "DESC",
  };
  sortStats = {
    field: "volume",
    side: "DESC",
  };
  isLoading = false;

  userPoints: UserPoints = {
    points: BN.ZERO,
    usd: BN.ZERO,
  };

  allTimeStats = {
    total_volume: "",
    total_trades: "",
  };
  totalStatsTableData: GetTotalStatsTableData[] = [];
  competitionData: GetCompetitionResponse[] = [];
  constructor(private rootStore: RootStore) {
    const { accountStore } = this.rootStore;
    makeAutoObservable(this);
    this.init();

    reaction(
      () => [this.activeFilter, accountStore.address, this.searchWallet, this.orderPerPage],
      () => {
        this.page = 1;
        this.getUserPoints();
        this.resolveFetch();
      },
    );

    reaction(
      () => [accountStore.isConnected],
      () => {
        if (!accountStore.isConnected) this.disconnect();
      },
    );
  }

  private resolveFetch = async () => {
    this.isLoading = true;
    if (this.sortLeaderboard.field === "volume") {
      await this.fetchSortedLeaderboard();
    } else {
      await this.fetchSortedPnlLeaderboard();
    }
    this.isLoading = false;
  };

  private fetchTotalState = async () => {
    const bcNetwork = FuelNetwork.getInstance();
    const data = await bcNetwork.fetchTotalState();
    this.allTimeStats = data.result.rows[0];
  };

  private fetchTotalStatsTableData = async () => {
    this.isLoading = true;
    const bcNetwork = FuelNetwork.getInstance();
    const data = await bcNetwork.fetchTotalStatsTableData({ side: this.sortStats.side });
    this.totalStatsTableData = data.result.rows;
    this.isLoading = false;
  };

  private fetchLeaderboard = async (wallets: string[]) => {
    return wallets;
    // const bcNetwork = FuelNetwork.getInstance();
    // const params = {
    //   limit: this.orderPerPage.key,
    //   page: this.page - 1,
    //   search: this.searchWallet,
    //   currentTimestamp: Math.floor(new Date().getTime() / 1000),
    //   interval: this.activeFilter.value * 3600,
    //   side: this.sortLeaderboard.side,
    //   wallets: wallets,
    // };
    // const t = await bcNetwork.getLeaderboard(params);
    // TODO: Сортировка по pnl
  };

  private fetchSortedPnlLeaderboard = async () => {
    const bcNetwork = FuelNetwork.getInstance();
    const params = {
      limit: this.orderPerPage.key,
      page: this.page - 1,
      side: this.sortLeaderboard.side,
      timeline: pnlTimeline[this.activeFilter.title as keyof typeof pnlTimeline],
    };
    const data = await bcNetwork.fetchSortedLeaderboardPnl(params);
    const wallets = data?.result?.rows.map((el) => el.user);
    this.fetchLeaderboard(wallets);
  };

  private fetchPnlLeaderboard = async () => {
    const bcNetwork = FuelNetwork.getInstance();
    const wallets = this.leaderboard.map((el) => el.walletId);
    const data = await bcNetwork.fetchLeaderBoardPnl({ wallets });
    this.leaderboardPnl = data?.result?.rows ?? [];
  };

  private fetchSortedLeaderboard = async () => {
    const bcNetwork = FuelNetwork.getInstance();
    const params = {
      limit: this.orderPerPage.key,
      page: this.page - 1,
      search: this.searchWallet,
      currentTimestamp: Math.floor(new Date().getTime() / 1000),
      interval: this.activeFilter.value * 3600,
      side: this.sortLeaderboard.side,
    };
    bcNetwork.setSentioConfig(config);

    const data = await bcNetwork.getSortedLeaderboard(params);
    const mainData = data?.result?.rows ?? [];

    let finalData = mainData;

    if (this.page === 1) {
      const dataMe = await this.fetchMeLeaderboard(params);
      if (dataMe.length > 0) {
        finalData = [...dataMe, ...mainData];
      }
    }

    this.leaderboard = finalData;
    this.fetchPnlLeaderboard();
  };

  private fetchMeLeaderboard = async (params: GetSortedLeaderboardQueryParams) => {
    const { accountStore } = this.rootStore;
    if (!accountStore.address) return [];
    const bcNetwork = FuelNetwork.getInstance();
    params.page = this.page - 1;
    params.search = accountStore.address;
    const data = await bcNetwork.getSortedLeaderboard(params);
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

  private fetchCompetition = async () => {
    this.isLoading = true;
    const bcNetwork = FuelNetwork.getInstance();
    const data = await bcNetwork.getCompetition({
      side: this.sortCompetitions.side,
      limit: 10,
      page: this.page - 1,
      search: this.searchWallet,
      startTime: new BN(setting.startDate).div(1000).toNumber(),
      endTime: new BN(setting.endDate).div(1000).toNumber(),
      minimumTradingVolume: setting.minimumTradingVolume,
    });
    this.competitionData = data?.result?.rows ?? [];
    this.isLoading = false;
  };

  public getUserPoints = async () => {
    const { accountStore, oracleStore } = this.rootStore;

    if (!accountStore.address) return BN.ZERO;

    const bcNetwork = FuelNetwork.getInstance();

    const fuelToken = CONFIG.TOKENS_BY_SYMBOL["FUEL"];
    const fuelPrice = BN.formatUnits(oracleStore.getTokenIndexPrice(fuelToken.priceFeed), DEFAULT_DECIMALS);

    const excluded = [
      `'0x1389cb25c66e55525b35f5c57c2f773ab953b80f396e503b6a55ed43707c4e0c'`,
      `'0xeb0dd9331390a24aa49bd0cf21c5d2127661c68ff38b614afdf41d4e59db5c37'`,
      `'0xd8962a0f26cf184ae35023e03cde4937cb6c0383be5ccc4e9aca73fe013928c0'`,
      `'0x210ec7f9fc740e5c6a06eab9134be3a73a7fd6a75f4a9b12c93436c9acbfc3bd'`,
      `'0xae519546161aa3d969092716f617dd1465f0ba76acdd91b2a9d6e51fd01a8ac5'`,
      `'0xfc07190ea30c0c308e8b552bdba73dd3abc30c60c00efbb048671fb8c55a97c3'`,
      `'0x6d0f1faf235cc8d159479ce436d02d6bea21e4579b619c47c7d1810237710d8c'`,
      `'0x642731ae54ab89722a0a1b5f0e7aac9e323f7aeb7d852709bc17de92e18789f3'`,
      `'0x1fba609a02f7207c0022d5813e4f406dfe91c18c93d7fb44fbf956dcf0d5b86f'`,
      `'0x690a1f28c8b5080f7b3dd55eeb4a0d12d0eebad67aaec0c6544c65e4f97d2896'`,
      `'0x9acaf0ab822be6b2bce28d794db0392de2681c95aa3774540c2aa425949810ec'`,
      `'0x4b69b918206ce5082097368f630e84be5da50a471e3284b44e105e0275af9d14'`,
      `'0x2b017a54b98cfa78df455c6d199c9e937c8af5804e9b719aa918bed0fcd33992'`,
      `'0x8b38e6756fdf18ce0d89b819ac04513d3286a876518dd7b7203efa00418e9ca6'`,
      `'0xa9221fafa62ed456b1ff0a17051998e88aadb1f9f1af0badb89a8b5a743e533f'`,
      `'0x669cc8ba4f7fec0c0277642e5aeb2ce6b5d409204df1888f7a546a9e0fd30783'`,
      `'0x9f85f7d7abbafbc84f4cce74097d70d4ebbec3b161db9ac1fb0aa5ea5709faa3'`,
      `'0xbe55d9b972639bafe700dd917a7a7dcca1b672185171e17d69de1e97eaf779c0'`,
      `'0x8e02b13009a5830f8ef5519afe70a7dfac3e193fdba954c25fb215783a163a5f'`,
      `'0x96c75d93dc777a4028aca7ba280077fbcc58e00086137a4ee9967038b0649c92'`,
      `'0xef90c66d4debb1cbeedc6c92d4bb8535451bea51a9fea6b3b8ba1dcc4e2e1ee9'`,
      `'0xbd7ebae1f5245a17762178e5bbbfea9dacfade646c9d42e5d04e1d133c9595f2'`,
    ];

    try {
      const response = await bcNetwork.fetchUserPoints({
        userAddress: accountStore.address!,
        fromTimestamp: 1739577601,
        toTimestamp: 1740787200,
        excluded,
      });
      const points = new BN(response.result.rows[0].points);

      this.userPoints = {
        points,
        usd: fuelPrice.multipliedBy(points),
      };
    } catch (error) {
      console.error("Failed to get user points", error);
    }
  };

  public setActivePage = (page: number) => {
    this.page = page;
    this.resolveFetch();
    this.fetchCompetition();
  };

  public setActiveFilter = (filter: FiltersProps) => {
    this.activeFilter = filter;
  };

  public setOrderPerPage = (page: PaginationProps) => {
    this.orderPerPage = page;
  };

  fetchLeaderboardDebounce = _.debounce(this.resolveFetch, 250);
  fetchCompetitionDebounce = _.debounce(this.fetchCompetition, 250);

  public setSearchWallet = (searchWallet: string) => {
    this.searchWallet = searchWallet;
    this.fetchLeaderboardDebounce();
    this.fetchCompetitionDebounce();
  };

  private findSideSort = (side: string) => {
    return side === "ASC" ? "DESC" : "ASC";
  };

  makeSort = (field: string) => {
    this.sortLeaderboard =
      field === this.sortLeaderboard.field
        ? { field: this.sortLeaderboard.field, side: this.findSideSort(this.sortLeaderboard.side) }
        : { field, side: "asc" };
    this.resolveFetch();
  };

  makeSortStat = (field: string) => {
    this.sortStats =
      field === this.sortStats.field
        ? { field: this.sortStats.field, side: this.findSideSort(this.sortStats.side) }
        : { field, side: "asc" };
    this.fetchTotalStatsTableData();
  };

  makeCompetitions = (field: string) => {
    this.sortCompetitions =
      field === this.sortCompetitions.field
        ? { field: this.sortCompetitions.field, side: this.findSideSort(this.sortCompetitions.side) }
        : { field, side: "asc" };
    this.fetchCompetition();
  };

  get maxTotalCount() {
    return this.leaderboard.reduce((max, item) => {
      return item?.totalCount > max ? item.totalCount : max;
    }, 0);
  }

  init = async () => {
    this.initialized = true;
    const date = new Date();
    this.getUserPoints();
    this.resolveFetch();
    this.fetchTotalState();
    this.fetchTotalStatsTableData();
    this.fetchCompetition();
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

export default LeaderboardStore;
