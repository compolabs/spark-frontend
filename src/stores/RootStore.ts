import { autorun, makeAutoObservable } from "mobx";

import { saveState } from "@src/utils/localStorage";
import AccountStore, { ISerializedAccountStore } from "@stores/AccountStore";
import FaucetStore from "@stores/FaucetStore";
import NotificationStore from "@stores/NotificationStore";
import SettingsStore, { ISerializedSettingStore } from "@stores/SettingsStore";
import TradeStore, { ISerializedTradeStore } from "@stores/TradeStore";

import { BalanceStore } from "./BalanceStore";
import { CollateralStore } from "./CollateralStore";
import { ModalStore } from "./ModalStore";
import OracleStore from "./OracleStore";

export interface ISerializedRootStore {
  accountStore?: ISerializedAccountStore;
  tradeStore?: ISerializedTradeStore;
  settingStore?: ISerializedSettingStore;
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
  collateralStore: CollateralStore;
  modalStore: ModalStore;

  private constructor(initState?: ISerializedRootStore) {
    this.notificationStore = new NotificationStore(this);
    this.accountStore = new AccountStore(this, initState?.accountStore);
    this.oracleStore = new OracleStore(this);
    this.faucetStore = new FaucetStore(this);
    this.settingsStore = new SettingsStore(this, initState?.settingStore);
    this.tradeStore = new TradeStore(this, initState?.tradeStore);
    this.balanceStore = new BalanceStore(this);
    this.collateralStore = new CollateralStore(this);
    this.modalStore = new ModalStore(this);

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
    return this.accountStore.initialized && this.tradeStore.initialized;
  }

  serialize = (): ISerializedRootStore => ({
    accountStore: this.accountStore.serialize(),
    tradeStore: this.tradeStore.serialize(),
    settingStore: this.settingsStore.serialize(),
  });
}
