import { storesContext, useStores } from "@stores/useStores";

import AccountStore from "./AccountStore";
import FaucetStore from "./FaucetStore";
import MixPanelStore from "./MixPanelStore";
import NotificationStore from "./NotificationStore";
// import SpotOrdersStore from "./SpotOrdersStore";
import OracleStore from "./OracleStore";
import QuickAssetsStore from "./QuickAssetsStore";
import RootStore from "./RootStore";
import SettingsStore from "./SettingsStore";
import TradeStore from "./TradeStore";
import SpotOrderBookStore from "./SpotOrderBookStore";

export {
  AccountStore,
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
