import React from "react";
import { Theme, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { GetTotalStatsTableData } from "@compolabs/spark-orderbook-ts-sdk";

import { Column } from "@components/Flex";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import { MarketSymbol } from "@screens/Stats/StatsTable/MarketSymbol";

import BN from "@utils/BN";
import { CONFIG } from "@utils/getConfig";
import { toCurrency } from "@utils/toCurrency";

import { SpotMarket } from "@entity";

const generatePnl = (value: string, theme: Theme) => {
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

const generateMarket = (market: string) => {
  const activeMarket = CONFIG.MARKETS.find((el) => el.contractId === market);
  if (!activeMarket) return;

  const spotMarket = new SpotMarket(activeMarket);

  return <MarketSymbol market={spotMarket} />;
};

const priceChangePercent = (item: GetTotalStatsTableData) =>
  isFinite(Number(item.last_price) / Number(item.price_24h_ago) - 1)
    ? ((Number(item.last_price) / Number(item.price_24h_ago) - 1) * 100).toString()
    : "0";

export const StatsItem = observer(({ item }: { item: GetTotalStatsTableData }) => {
  const theme = useTheme();
  return (
    <StatsContainer gap="12px">
      <SmartFlex>{generateMarket(item.market)}</SmartFlex>
      <Text type={TEXT_TYPES.BUTTON} primary>
        {toCurrency(new BN(item.last_price).toSignificant(2))}
      </Text>
      <Text type={TEXT_TYPES.BUTTON} primary>
        {generatePnl(priceChangePercent(item), theme)}
      </Text>
      <Text type={TEXT_TYPES.BUTTON} primary>
        {toCurrency(new BN(item.total_volume_24h).toSignificant(2))}
      </Text>
      <Text type={TEXT_TYPES.BUTTON} primary>
        {toCurrency(new BN(item.total_volume_7d).toSignificant(2))}
      </Text>
    </StatsContainer>
  );
});

export const StatsItemMobile = observer(({ item }: { item: GetTotalStatsTableData }) => {
  const theme = useTheme();
  return (
    <StatsContainer gap="12px">
      <TitleMarket>
        <TitleMarket>{generateMarket(item.market)}</TitleMarket>
      </TitleMarket>
      <Column style={{ width: "100%", gap: "12px" }}>
        <SmartFlex width="100%">
          <ColumnStats>
            <Text secondary>Price</Text>
            <Text type={TEXT_TYPES.BUTTON} primary>
              {toCurrency(new BN(item.last_price).toSignificant(2))}
            </Text>
          </ColumnStats>
          <ColumnStats>
            <Text secondary>24h Change</Text>
            <Text type={TEXT_TYPES.BUTTON} primary>
              {generatePnl(priceChangePercent(item), theme)}
            </Text>
          </ColumnStats>
        </SmartFlex>
        <SmartFlex width="100%">
          <ColumnStats>
            <Text secondary>24h Volume</Text>
            <Text type={TEXT_TYPES.BUTTON} primary>
              {toCurrency(new BN(item.total_volume_24h).toSignificant(2))}
            </Text>
          </ColumnStats>
          <ColumnStats>
            <Text secondary>7d Volume</Text>
            <Text type={TEXT_TYPES.BUTTON} primary>
              {toCurrency(new BN(item.total_volume_7d).toSignificant(2))}
            </Text>
          </ColumnStats>
        </SmartFlex>
      </Column>
    </StatsContainer>
  );
});

const ColumnStats = styled(Column)`
  width: 50%;
`;
const TitleMarket = styled(Text)`
  width: 100%;
`;
const TextStyled = styled(Text)`
  font-size: 14px;
`;

const StatsContainer = styled(SmartFlex)`
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

  ${media.mobile} {
    flex-direction: column;
  }
`;
