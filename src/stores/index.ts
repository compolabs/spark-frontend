import { storesContext, useStores } from "@stores/useStores";

import AccountStore from "./AccountStore";
import DashboardStore from "./DashboardStore";
import FaucetStore from "./FaucetStore";
import MixPanelStore from "./MixPanelStore";
import NotificationStore from "./NotificationStore";
// import SpotOrdersStore from "./SpotOrdersStore";
import OracleStore from "./OracleStore";
import QuickAssetsStore from "./QuickAssetsStore";
import RootStore from "./RootStore";
import SettingsStore from "./SettingsStore";
import SpotOrderBookStore from "./SpotOrderBookStore";
import TradeStore from "./TradeStore";

export {
  AccountStore,
  DashboardStore,
  FaucetStore,
  MixPanelStore,
  NotificationStore,
  OracleStore,
  QuickAssetsStore,
  RootStore,
  SettingsStore,
  SpotOrderBookStore,
  storesContext,
  // SpotOrdersStore,
  TradeStore,
  useStores,
};
