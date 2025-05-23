import { Undefinable } from "tsdef";

import { AssetType } from "@blockchain/fuel/types";

import { Market } from "./getConfig";

export const getTokenType = (markets: Market[], assetId: string): Undefinable<AssetType> => {
  for (const market of markets) {
    if (market.baseAssetId === assetId) {
      return AssetType.Base;
    } else if (market.quoteAssetId === assetId) {
      return AssetType.Quote;
    }
  }
  return;
};
