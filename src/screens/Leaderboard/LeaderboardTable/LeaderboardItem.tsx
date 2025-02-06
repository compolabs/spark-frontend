import React, { useMemo } from "react";
import { Theme, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import copy from "copy-to-clipboard";
import { observer } from "mobx-react";

import { TraderVolumeResponse } from "@compolabs/spark-orderbook-ts-sdk";

import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { media } from "@themes/breakpoints";

import copyIcon from "@assets/icons/copy.svg";
import oneSt from "@assets/images/1st.png";
import twoSt from "@assets/images/2st.png";
import three from "@assets/images/3st.png";

import { LeaderboardStore, useStores } from "@stores";

import { pnlTimeline } from "@screens/Dashboard/const.ts";

import BN from "@utils/BN.ts";

const generatePosition = (key: TraderVolumeResponse["id"]) => {
  if (key === 1) return <img alt="1st" height={40} src={oneSt} width={40} />;
  if (key === 2) return <img alt="2st" height={40} src={twoSt} width={40} />;
  if (key === 3) return <img alt="3st" height={40} src={three} width={40} />;
  return (
    <PositionBox>
      <Text type={TEXT_TYPES.H} primary>
        {key}
      </Text>
    </PositionBox>
  );
};

const generatePnl = (wallet: string, leaderboardStore: LeaderboardStore, theme: Theme) => {
  const pnlData = leaderboardStore.leaderboardPnl.find((el) => el.user === wallet);
  const timeKey = pnlTimeline[leaderboardStore.activeFilter.title as keyof typeof pnlTimeline];
  const pnl = pnlData ? pnlData[timeKey] : "0";

  const bnPnl = new BN(pnl).decimalPlaces(2, BN.ROUND_UP);
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
      {`${sign}$${displayValue}`}
    </TextStyled>
  );
};

export const LeaderboardItem = observer(({ item }: { item: TraderVolumeResponse }) => {
  const theme = useTheme();
  const { notificationStore, leaderboardStore } = useStores();
  const shortAddress = useMemo(() => {
    return `${item.walletId.slice(0, 6)}...${item.walletId.slice(-4)}`;
  }, [item]);

  const handleAddressCopy = () => {
    copy(item.walletId);
    notificationStore.success({ text: "Address was copied!", address: item.walletId });
  };
  return (
    <LeaderboardContainer gap="12px">
      <SmartFlex gap="12px">{generatePosition(item.id)}</SmartFlex>
      <SmartFlex center="y" gap="8px" style={{ flex: 1 }}>
        <AddressText type={TEXT_TYPES.BODY} primary>
          {shortAddress}
        </AddressText>
        <CopyIconStyled src={copyIcon} onClick={handleAddressCopy} />
        {item.isYour && <SnackStyled>You</SnackStyled>}
      </SmartFlex>
      <SmartFlex style={{ flex: 0.42 }}>{generatePnl(item.walletId, leaderboardStore, theme)}</SmartFlex>
      <TextStyled style={{ width: 90, textAlign: "right" }} type={TEXT_TYPES.BODY} primary>
        ${item.traderVolume.toFixed(2)}
      </TextStyled>
    </LeaderboardContainer>
  );
});

export const LeaderboardItemMobile = observer(({ item }: { item: TraderVolumeResponse }) => {
  const theme = useTheme();
  const { notificationStore, leaderboardStore } = useStores();
  const shortAddress = useMemo(() => {
    return `${item.walletId.slice(0, 6)}...${item.walletId.slice(-4)}`;
  }, [item]);

  const handleAddressCopy = () => {
    copy(item.walletId);
    notificationStore.success({ text: "Address was copied!", address: item.walletId });
  };

  return (
    <LeaderboardContainer gap="12px">
      <SmartFlex gap="12px">{generatePosition(item.id)}</SmartFlex>
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
            {generatePnl(item.walletId, leaderboardStore, theme)}
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
  padding: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.strokeSecondary};
  &:last-child {
    border-bottom: none;
  }
`;

const PositionBox = styled(SmartFlex)`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.accentPrimary};
  align-items: center;
  justify-content: center;
  border-radius: 4px;
`;

const SnackStyled = styled.span`
  border-radius: 8px;
  background: black;
  display: flex;
  padding: 4px;
  ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}
`;
