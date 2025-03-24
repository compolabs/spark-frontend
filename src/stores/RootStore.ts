import { autorun, makeAutoObservable } from "mobx";

import AccountStore, { SerializedAccountStore } from "@stores/AccountStore";
import DashboardStore from "@stores/DashboardStore";
import FaucetStore from "@stores/FaucetStore";
import LeaderboardStore from "@stores/LeaderboardStore";
import MixPanelStore from "@stores/MixPanelStore";
import NotificationStore from "@stores/NotificationStore";
import QuickAssetsStore from "@stores/QuickAssetsStore";
import SettingsStore, { SerializedSettingStore } from "@stores/SettingsStore";
import TradeStore, { SerializedTradeStore } from "@stores/TradeStore";

import { saveState } from "@utils/localStorage";

import { BalanceStore } from "./BalanceStore";
import { ModalStore } from "./ModalStore";
import OracleStore from "./OracleStore";
import SpotOrderBookStore from "./SpotOrderBookStore";
import SwapStore from "./SwapStore";

export interface SerializedRootStore {
  accountStore?: SerializedAccountStore;
  tradeStore?: SerializedTradeStore;
  settingStore?: SerializedSettingStore;
}

export default class RootStore {
  static instance?: RootStore;
  accountStore: AccountStore;
  oracleStore: OracleStore;
  faucetStore: FaucetStore;
  settingsStore: SettingsStore;
  notificationStore: NotificationStore;
  tradeStore: TradeStore;
  balanceStore: BalanceStore;
  modalStore: ModalStore;
  swapStore: SwapStore;
  mixPanelStore: MixPanelStore;
  quickAssetsStore: QuickAssetsStore;
  spotOrderBookStore: SpotOrderBookStore;
  dashboardStore: DashboardStore;
  leaderboardStore: LeaderboardStore;

  private constructor(initState?: SerializedRootStore) {
    this.notificationStore = new NotificationStore(this);
    this.accountStore = new AccountStore(this, initState?.accountStore);
    this.oracleStore = new OracleStore(this);
    this.faucetStore = new FaucetStore(this);
    this.settingsStore = new SettingsStore(this, initState?.settingStore);
    this.tradeStore = new TradeStore(this, initState?.tradeStore);
    this.balanceStore = new BalanceStore(this);
    this.modalStore = new ModalStore(this);
    this.swapStore = new SwapStore(this);
    this.mixPanelStore = new MixPanelStore(this);
    this.quickAssetsStore = new QuickAssetsStore(this);
    this.spotOrderBookStore = new SpotOrderBookStore(this);
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

  static create = (initState?: SerializedRootStore) => {
    if (!RootStore.instance) {
      RootStore.instance = new RootStore(initState);
    }

    return RootStore.instance;
  };

  get initialized() {
    return this.accountStore.initialized && this.tradeStore.initialized;
  }

  serialize = (): SerializedRootStore => ({
    accountStore: this.accountStore.serialize(),
    tradeStore: this.tradeStore.serialize(),
    settingStore: this.settingsStore.serialize(),
  });
}
