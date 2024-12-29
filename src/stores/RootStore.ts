import { autorun, makeAutoObservable } from "mobx";

import { saveState } from "@utils/localStorage";

import { AccountStore, ISerializedAccountStore } from "./AccountStore";
import { BalanceStore } from "./BalanceStore";
import { DashboardStore } from "./DashboardStore";
import { FaucetStore } from "./FaucetStore";
import { LeaderboardStore } from "./LeaderboardStore";
import { ISerializedMarketStore, MarketStore } from "./MarketStore";
import MixPanelStore from "./MixPanelStore";
import { ModalStore } from "./ModalStore";
import NotificationStore from "./NotificationStore";
import { OracleStore } from "./OracleStore";
import { PerpCreateOrderStore } from "./PerpCreateOrderStore";
import { PerpMarketInfoStore } from "./PerpMarketInfoStore";
import { QuickAssetsStore } from "./QuickAssetsStore";
import { ISerializedSettingStore, SettingsStore } from "./SettingsStore";
import { SpotCreateOrderStore } from "./SpotCreateOrderStore";
import { SpotMarketInfoStore } from "./SpotMarketInfoStore";
import SpotOrderBookStore from "./SpotOrderBookStore";
import { SpotTableStore } from "./SpotTableStore";
import { SwapStore } from "./SwapStore";

export interface ISerializedRootStore {
  accountStore?: ISerializedAccountStore;
  marketStore?: ISerializedMarketStore;
  settingStore?: ISerializedSettingStore;
}

export default class RootStore {
  static instance?: RootStore;

  // Utility Stores
  accountStore: AccountStore;
  oracleStore: OracleStore;
  marketStore: MarketStore;
  settingsStore: SettingsStore;
  notificationStore: NotificationStore;
  balanceStore: BalanceStore;
  modalStore: ModalStore;
  mixPanelStore: MixPanelStore;
  quickAssetsStore: QuickAssetsStore;

  swapStore: SwapStore;
  faucetStore: FaucetStore;

  // Spot Stores
  spotCreateOrderStore: SpotCreateOrderStore;
  spotMarketInfoStore: SpotMarketInfoStore;
  spotOrderBookStore: SpotOrderBookStore;
  spotTableStore: SpotTableStore;

  // Prep Stores

  perpCreateOrderStore: PerpCreateOrderStore;
  perpMarketInfoStore: PerpMarketInfoStore;

  dashboardStore: DashboardStore;
  leaderboardStore: LeaderboardStore;

  private constructor(initState?: ISerializedRootStore) {
    this.accountStore = new AccountStore(this, initState?.accountStore);
    this.oracleStore = new OracleStore(this);
    this.marketStore = new MarketStore(this, initState?.marketStore);
    this.settingsStore = new SettingsStore(this, initState?.settingStore);
    this.notificationStore = new NotificationStore(this);
    this.balanceStore = new BalanceStore(this);
    this.modalStore = new ModalStore(this);
    this.mixPanelStore = new MixPanelStore(this);
    this.quickAssetsStore = new QuickAssetsStore(this);

    this.faucetStore = new FaucetStore(this);
    this.swapStore = new SwapStore(this);

    this.spotCreateOrderStore = new SpotCreateOrderStore(this);
    this.spotMarketInfoStore = new SpotMarketInfoStore(this);
    this.spotOrderBookStore = new SpotOrderBookStore(this);
    this.spotTableStore = new SpotTableStore(this);

    this.perpCreateOrderStore = new PerpCreateOrderStore(this);
    this.perpMarketInfoStore = new PerpMarketInfoStore(this);

    this.dashboardStore = new DashboardStore(this);
    this.leaderboardStore = new LeaderboardStore(this);

    makeAutoObservable(this);

    autorun(
      () => {
        saveState(this.serialize());
      },
      { delay: 1000 },
    );
  }

  static create = (initState?: ISerializedRootStore) => {
    if (!RootStore.instance) {
      RootStore.instance = new RootStore(initState);
    }

    return RootStore.instance;
  };

  get initialized() {
    return this.accountStore.initialized && this.marketStore.initialized;
  }

  serialize = (): ISerializedRootStore => ({
    accountStore: this.accountStore.serialize(),
    settingStore: this.settingsStore.serialize(),
    marketStore: this.marketStore.serialize(),
  });
}
