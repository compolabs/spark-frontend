import React, { useMemo } from "react";
import { Theme, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import copy from "copy-to-clipboard";
import { observer } from "mobx-react";

import { GetCompetitionResponse } from "@compolabs/spark-orderbook-ts-sdk";

import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";
import { media } from "@themes/breakpoints";

import copyIcon from "@assets/icons/copy.svg";
import oneSt from "@assets/images/1st.png";
import twoSt from "@assets/images/2st.png";
import three from "@assets/images/3st.png";

import { useStores } from "@stores";

import BN from "@utils/BN";
import { toCurrency } from "@utils/toCurrency.ts";

const generatePosition = (key: number) => {
  if (key === 1) return <img alt="1st" height={40} src={oneSt} width={40} />;
  if (key === 2) return <img alt="2st" height={40} src={twoSt} width={40} />;
  if (key === 3) return <img alt="3st" height={40} src={three} width={40} />;
  return (
    <PositionBox>
      <Text type="H" primary>
        {key}
      </Text>
    </PositionBox>
  );
};

const generatePnl = (pnl: string, theme: Theme) => {
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
    <TextStyled color={color} primary={bnPnl.eq(BN.ZERO)} type="BODY">
      {`${sign}$${displayValue}`}
    </TextStyled>
  );
};

export const CompetitionsItem = observer(({ item }: { item: GetCompetitionResponse }) => {
  const theme = useTheme();
  const { notificationStore } = useStores();
  const shortAddress = useMemo(() => {
    return `${item.user.slice(0, 6)}...${item.user.slice(-4)}`;
  }, [item]);

  const handleAddressCopy = () => {
    copy(item.user);
    notificationStore.success({ text: "Address was copied!", address: item.user });
  };
  return (
    <CompetitionsContainer gap="12px">
      <SmartFlex gap="12px">{generatePosition(item.position)}</SmartFlex>
      <SmartFlex center="y" gap="8px" style={{ flex: 1 }}>
        <AddressText type="BODY" primary>
          {shortAddress}
        </AddressText>
        <CopyIconStyled src={copyIcon} onClick={handleAddressCopy} />
      </SmartFlex>
      <SmartFlex style={{ flex: 0.37 }}>{generatePnl(item.total_pnlComp1, theme)}</SmartFlex>
      <TextStyled style={{ width: 90, textAlign: "right" }} type="BODY" primary>
        {toCurrency(parseFloat(item.total_volume).toFixed(2))}
      </TextStyled>
    </CompetitionsContainer>
  );
});

export const CompetitionsItemMobile = observer(({ item }: { item: GetCompetitionResponse }) => {
  const theme = useTheme();
  const { notificationStore } = useStores();
  const shortAddress = useMemo(() => {
    return `${item.user.slice(0, 6)}...${item.user.slice(-4)}`;
  }, [item]);

  const handleAddressCopy = () => {
    copy(item.user);
    notificationStore.success({ text: "Address was copied!", address: item.user });
  };

  return (
    <CompetitionsContainer gap="12px">
      <SmartFlex gap="12px">{generatePosition(item.position)}</SmartFlex>
      <SmartFlex center="y" gap="8px" style={{ flex: 1 }} column>
        <SmartFlex alignItems="center" gap="8px">
          <AddressText type="BODY" primary>
            {shortAddress}
          </AddressText>
          <CopyIconStyled src={copyIcon} onClick={handleAddressCopy} />
        </SmartFlex>
        <SmartFlex justifyContent="space-between">
          <AddressText type="BODY">PnL:</AddressText>
          <TextStyled style={{ textAlign: "right" }} type="BODY" primary>
            {generatePnl(item.total_pnlComp1, theme)}
          </TextStyled>
        </SmartFlex>
        <SmartFlex justifyContent="space-between">
          <AddressText type="BODY">Volume:</AddressText>{" "}
          <TextStyled style={{ textAlign: "right" }} type="BODY" primary>
            {toCurrency(parseFloat(item.total_volume).toFixed(2))}
          </TextStyled>
        </SmartFlex>
      </SmartFlex>
    </CompetitionsContainer>
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

const CompetitionsContainer = styled(SmartFlex)`
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
