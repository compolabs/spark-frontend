import React, { useMemo } from "react";
import { Theme, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import copy from "copy-to-clipboard";
import { observer } from "mobx-react";

import { GetTotalStatsTableData, TraderVolumeResponse } from "@compolabs/spark-orderbook-ts-sdk";

import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { media } from "@themes/breakpoints";

import copyIcon from "@assets/icons/copy.svg";

import { LeaderboardStore, useStores } from "@stores";

import { MarketSymbol } from "@screens/Stats/StatsTable/MarketSymbol.tsx";

import BN from "@utils/BN";
import { CONFIG } from "@utils/getConfig.ts";
import { toCurrency } from "@utils/toCurrency.ts";

import { SpotMarket } from "@entity";

const generatePnl = (value: string, leaderboardStore: LeaderboardStore, theme: Theme) => {
  const bnPnl = new BN(value).decimalPlaces(2, BN.ROUND_UP);
  const isPositive = bnPnl.isGreaterThan(0);
  const isNegative = bnPnl.isLessThan(0);
  const sign = isPositive ? "+" : isNegative ? "-" : "";
  const displayValue = bnPnl.abs().toString();

  const color = bnPnl.isGreaterThan(0)
    ? theme.colors.greenLight
    : bnPnl.isLessThan(0)
      ? theme.colors.redLight
      : undefined;

  return (
    <TextStyled color={color} primary={bnPnl.eq(BN.ZERO)} type={TEXT_TYPES.BODY}>
      {`${sign}${displayValue}%`}
    </TextStyled>
  );
};

export const StatsItem = observer(({ item }: { item: GetTotalStatsTableData }) => {
  const { leaderboardStore } = useStores();
  const theme = useTheme();

  const generateMarket = (market: string) => {
    const activeMarket = CONFIG.MARKETS.find((el) => el.contractId === market);
    if (!activeMarket) return <></>;
    const spotMarket = new SpotMarket(activeMarket.baseAssetId, activeMarket.quoteAssetId, activeMarket.contractId);
    return <MarketSymbol market={spotMarket} />;
  };
  const priceChangePercent = (
    ((Number(item.last_price) - Number(item.price_24h_ago)) / Number(item.price_24h_ago)) *
    100
  ).toString();

  return (
    <LeaderboardContainer gap="12px">
      <SmartFlex>{generateMarket(item.market)}</SmartFlex>
      <Text type={TEXT_TYPES.BUTTON} primary>
        {toCurrency(new BN(item.last_price).toSignificant(2))}
      </Text>
      <Text type={TEXT_TYPES.BUTTON} primary>
        {generatePnl(priceChangePercent, leaderboardStore, theme)}
      </Text>
      <Text type={TEXT_TYPES.BUTTON} primary>
        {toCurrency(new BN(item.total_volume_24h).toSignificant(2))}
      </Text>
      <Text type={TEXT_TYPES.BUTTON} primary>
        {toCurrency(new BN(item.total_volume_7d).toSignificant(2))}
      </Text>
    </LeaderboardContainer>
  );
});

export const StatsItemMobile = observer(({ item }: { item: TraderVolumeResponse }) => {
  const { notificationStore } = useStores();
  const shortAddress = useMemo(() => {
    return `${item.walletId.slice(0, 6)}...${item.walletId.slice(-4)}`;
  }, [item]);

  const handleAddressCopy = () => {
    copy(item.walletId);
    notificationStore.success({ text: "Address was copied!", address: item.walletId });
  };

  return (
    <LeaderboardContainer gap="12px">
      <SmartFlex gap="12px">{item.id}</SmartFlex>
      <SmartFlex center="y" gap="8px" style={{ flex: 1 }} column>
        <SmartFlex alignItems="center" gap="8px">
          <AddressText type={TEXT_TYPES.BODY} primary>
            {shortAddress}
          </AddressText>
          <CopyIconStyled src={copyIcon} onClick={handleAddressCopy} />
          {item.isYour && <SnackStyled>You</SnackStyled>}
        </SmartFlex>
        <SmartFlex justifyContent="space-between">
          <AddressText type={TEXT_TYPES.BODY}>PnL (24h):</AddressText>
          <TextStyled style={{ width: 90, textAlign: "right" }} type={TEXT_TYPES.BODY} primary>
            {/*{generatePnl(item.walletId, leaderboardStore, theme)}*/}
          </TextStyled>
        </SmartFlex>
        <SmartFlex justifyContent="space-between">
          <AddressText type={TEXT_TYPES.BODY}>Volume (24h):</AddressText>{" "}
          <TextStyled style={{ width: 90, textAlign: "right" }} type={TEXT_TYPES.BODY} primary>
            ${item.traderVolume.toFixed(2)}
          </TextStyled>
        </SmartFlex>
      </SmartFlex>
    </LeaderboardContainer>
  );
});

const AddressText = styled(Text)`
  font-size: 14px;

  ${media.mobile} {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const CopyIconStyled = styled.img`
  width: 16px;
  height: 16px;
`;

const TextStyled = styled(Text)`
  font-size: 14px;
`;

const LeaderboardContainer = styled(SmartFlex)`
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.strokeSecondary};
  padding: 20px 8px;
  &:last-child {
    border-bottom: none;
  }
  ${Text} {
    flex: 1;
  }
  ${SmartFlex} {
    flex: 1;
  }
`;

const SnackStyled = styled.span`
  border-radius: 8px;
  background: black;
  display: flex;
  padding: 4px;
  ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}
`;
