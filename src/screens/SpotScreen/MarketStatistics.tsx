import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column, DesktopRow, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";
import { toCurrency } from "@utils/toCurrency";

const MarketStatistics: React.FC = observer(() => {
  const { tradeStore, spotOrderBookStore } = useStores();
  const theme = useTheme();
  const media = useMedia();

  const indexPriceBn = BN.formatUnits(spotOrderBookStore.lastTradePrice, DEFAULT_DECIMALS);
  const volumeInDollars = tradeStore.spotMarketInfo.volume.multipliedBy(indexPriceBn);

  const indexPrice = toCurrency(indexPriceBn.toSignificant(2));
  const volume24h = toCurrency(volumeInDollars.toSignificant(2));
  const high24h = toCurrency(tradeStore.spotMarketInfo.high.toSignificant(2));
  const low24h = toCurrency(tradeStore.spotMarketInfo.low.toSignificant(2));

  const spotStatsArr = [
    { title: "24h volume", value: volume24h },
    { title: "24h High", value: high24h },
    { title: "24h Low", value: low24h },
  ];

  const activeDataArr = spotStatsArr;

  const renderMobile = () => {
    return (
      <MobileRoot>
        <Text color={theme.colors.greenLight} type={TEXT_TYPES.H}>
          {indexPrice}
        </Text>
        <MobileStatsContent gap="12px" justifySelf="flex-end">
          {activeDataArr.map((data) => (
            <SmartFlex key={data.title} gap="2px" column>
              <Text>{data.title}</Text>
              <Text primary>{data.value}</Text>
            </SmartFlex>
          ))}
        </MobileStatsContent>
      </MobileRoot>
    );
  };

  const renderDesktop = () => {
    return (
      <Root>
        <PriceRow alignItems="center">
          <Column alignItems="flex-end">
            <Text type={TEXT_TYPES.H} primary>
              {indexPrice}
            </Text>
          </Column>
          <DesktopRow>
            {activeDataArr.map(({ title, value }) => (
              <React.Fragment key={title}>
                <SizedBox height={30} style={{ background: theme.colors.bgPrimary, margin: "0 8px" }} width={1} />
                <Column>
                  <Text type={TEXT_TYPES.SUPPORTING}>{title}</Text>
                  <SizedBox height={4} />
                  <Text type={TEXT_TYPES.BODY} primary>
                    {value}
                  </Text>
                </Column>
              </React.Fragment>
            ))}
          </DesktopRow>
        </PriceRow>
      </Root>
    );
  };

  return media.mobile ? renderMobile() : renderDesktop();
});

export default MarketStatistics;

const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  width: 100%;
`;

const MobileRoot = styled(SmartFlex)`
  display: grid;
  grid-template-columns: min-content 1fr;
  gap: 8px;
  padding: 8px;
`;

const PriceRow = styled(Row)`
  align-items: center;
  justify-content: flex-end;

  ${media.desktop} {
    justify-content: flex-start;
  }
`;

const MobileStatsContent = styled(SmartFlex)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas:
    ". ."
    ". .";
`;
