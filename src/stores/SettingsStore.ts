import { makeAutoObservable } from "mobx";

import { LimitType } from "@compolabs/spark-orderbook-ts-sdk";

import { THEME_TYPE } from "@themes/ThemeProvider";

import RootStore from "@stores/RootStore";

import { ORDER_TYPE } from "@screens/SpotScreen/RightBlock/CreateOrder/CreateOrderVM";

export interface ISerializedSettingStore {
  isUserAgreedWithTerms?: boolean;
  isShowDepositInfo?: string[];
  isCompleteOnboardingProcess?: boolean;
  isInfoDashboardPerHours?: boolean;
  tradeTableSize?: number;
  orderType?: ORDER_TYPE;
}

export enum TRADE_TABLE_SIZE {
  XS,
  S,
  M,
  L,
  AUTO,
}

class SettingsStore {
  private readonly rootStore: RootStore;
  selectedTheme: THEME_TYPE = THEME_TYPE.DARK_THEME;

  constructor(rootStore: RootStore, initState?: ISerializedSettingStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    if (initState) {
      this.setIsUserAgreedWithTerms(initState.isUserAgreedWithTerms ?? false);
      this.setIsCompletedOnboardingProcess(initState.isCompleteOnboardingProcess ?? false);
      this.setIsInfoDashboardPerHours(initState.isInfoDashboardPerHours ?? false);
      this.setTradeTableSize(initState.tradeTableSize ?? TRADE_TABLE_SIZE.S);
      this.setOrderType(initState.orderType ?? ORDER_TYPE.Limit);
      this.setIsShowDepositInfo(initState.isShowDepositInfo ?? []);
    }
  }

  isUserAgreedWithTerms = false;
  setIsUserAgreedWithTerms = (value: boolean) => (this.isUserAgreedWithTerms = value);

  isShowDepositInfo = [""];
  setIsShowDepositInfo = (value: string[]) => (this.isShowDepositInfo = value);

  isCompleteOnboardingProcess = false;
  setIsCompletedOnboardingProcess = (value: boolean) => (this.isCompleteOnboardingProcess = value);

  isInfoDashboardPerHours = false;
  setIsInfoDashboardPerHours = (value: boolean) => (this.isInfoDashboardPerHours = value);

  depositModalOpened: boolean = false;
  setDepositModal = (s: boolean) => (this.depositModalOpened = s);

  tradeTableSize: TRADE_TABLE_SIZE = TRADE_TABLE_SIZE.S;
  setTradeTableSize = (v: TRADE_TABLE_SIZE) => (this.tradeTableSize = v);

  orderType: ORDER_TYPE = ORDER_TYPE.Market;
  setOrderType = (v: ORDER_TYPE) => (this.orderType = v);

  timeInForce: LimitType = LimitType.GTC;
  setTimeInForce = (v: LimitType) => (this.timeInForce = v);

  serialize = (): ISerializedSettingStore => ({
    isUserAgreedWithTerms: this.isUserAgreedWithTerms,
    isCompleteOnboardingProcess: this.isCompleteOnboardingProcess,
    isInfoDashboardPerHours: this.isInfoDashboardPerHours,
    isShowDepositInfo: this.isShowDepositInfo,
    tradeTableSize: this.tradeTableSize,
    orderType: this.orderType,
  });
}

export default SettingsStore;
