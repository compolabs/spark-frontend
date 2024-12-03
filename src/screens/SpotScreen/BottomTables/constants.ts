import { Config } from "react-popper-tooltip";

import tableLargeSize from "@assets/icons/tableLargeSize.svg";
import tableMediumSize from "@assets/icons/tableMediumSize.svg";
import tableSizeExtraSmall from "@assets/icons/tableSizeExtraSmall.svg";
import tableSmallSize from "@assets/icons/tableSmallSize.svg";

import { TRADE_TABLE_SIZE } from "@stores/SettingsStore";

export const MAX_TABLE_HEIGHT = {
  [TRADE_TABLE_SIZE.XS]: "120px",
  [TRADE_TABLE_SIZE.S]: "197px",
  [TRADE_TABLE_SIZE.M]: "263px",
  [TRADE_TABLE_SIZE.L]: "395px",
  [TRADE_TABLE_SIZE.AUTO]: "100%",
};

export const TABLE_SIZES_CONFIG = [
  { title: "Extra small", icon: tableSizeExtraSmall, size: TRADE_TABLE_SIZE.XS },
  { title: "Small", icon: tableSmallSize, size: TRADE_TABLE_SIZE.S },
  { title: "Medium", icon: tableMediumSize, size: TRADE_TABLE_SIZE.M },
  { title: "Large", icon: tableLargeSize, size: TRADE_TABLE_SIZE.L },
];

export const RESIZE_TOOLTIP_CONFIG: Config = { placement: "bottom-start", trigger: "click" };
