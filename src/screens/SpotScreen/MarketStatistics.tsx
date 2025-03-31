import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { BN } from "@blockchain/fuel/types";

import { Column, DesktopRow, Row } from "@components/Flex";
import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";
import Tooltip from "@components/Tooltip";
import { media } from "@themes/breakpoints";

import PythIcon from "@assets/icons/pyth.svg?react";

import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";

import DesktopMarketInfoTooltip from "@screens/SpotScreen/DesktopMarketInfoTooltip";
import { MarketInfoItem } from "@screens/SpotScreen/DesktopMarketInfoTooltip/DesktopMarketInfoTooltip";

import { DEFAULT_DECIMALS, PYTH_LINK } from "@constants";
import { toCurrency } from "@utils/toCurrency";

const MarketStatistics: React.FC = observer(() => {
  const { tradeStore, spotOrderBookStore } = useStores();
  const theme = useTheme();
  const media = useMedia();

  const indexPriceBn = BN.formatUnits(spotOrderBookStore.lastTradePrice, DEFAULT_DECIMALS);

  const { quoteToken, precision } = tradeStore.market ?? {};

  const volume = tradeStore.spotMarketInfo.volume.multipliedBy(indexPriceBn);

  const oraclePrice = tradeStore.market?.priceUnits.toFormat(precision);
  const indexPrice = toCurrency(indexPriceBn.toFormat(precision), quoteToken?.symbol);
  const volume24h = toCurrency(volume.toFormat(precision), quoteToken?.symbol);
  const high24h = toCurrency(tradeStore.spotMarketInfo.high.toFormat(precision), quoteToken?.symbol);
  const low24h = toCurrency(tradeStore.spotMarketInfo.low.toFormat(precision), quoteToken?.symbol);

  const spotStatsArr: MarketInfoItem[] = [
    {
      title: "Oracle price",
      value: oraclePrice,
      icon: <PythIcon height={10} width={10} />,
      tooltip: (
        <SmartFlex gap="20px" column>
          <Text>The current Oracle Price of the selected assets ({tradeStore.market?.baseToken.symbol})</Text>
          <Text>
            Oracle provided by{" "}
            <LinkStyled
              onClick={() => {
                window.open(PYTH_LINK, "_blank");
              }}
            >
              Pyth
            </LinkStyled>
          </Text>
        </SmartFlex>
      ),
    },
    {
      title: "24h volume",
      value: volume24h,
      tooltip: <Text>Total volume traded in the market over the past 24 hours.</Text>,
    },
    {
      title: "24h High",
      value: high24h,
      tooltip: <Text>The highest price reached by the asset in the last 24 hours.</Text>,
    },
    {
      title: "24h Low",
      value: low24h,
      tooltip: <Text>The lowest price reached by the asset in the last 24 hours.</Text>,
    },
  ];

  const activeDataArr = spotStatsArr;
  // const marketPrice = spotOrderBookStore.marketPriceByContractId(tradeStore.market?.contractAddress ?? "");

  const renderMobile = () => {
    return (
      <MobileRoot>
        <Text color={theme.colors.greenLight} type="H">
          {indexPrice}
        </Text>
        <MobileStatsContent gap="12px" justifySelf="flex-end">
          {activeDataArr.map((data) => (
            <SmartFlex key={data.title} gap="2px" column>
              <Text>{data.title}</Text>
              <SmartFlexStyled>
                <Text primary>{data.value}</Text>
                {data?.icon}
              </SmartFlexStyled>
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
            <Tooltip
              config={{
                placement: "bottom-start",
                trigger: "hover",
              }}
              content={
                <TooltipContainer>
                  <Text>The latest Fill Price for the market</Text>
                </TooltipContainer>
              }
            >
              <Text type="H" primary>
                {indexPrice}
              </Text>
            </Tooltip>
          </Column>
          <DesktopRow>
            {activeDataArr.map((el) => (
              <DesktopMarketInfoTooltip key={el.title} marketData={el} />
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

const SmartFlexStyled = styled(SmartFlex)`
  justify-content: center;
  align-items: center;
  gap: 2px;
`;

const LinkStyled = styled.a`
  color: ${({ theme }) => theme.colors.greenLight};
  &:hover {
    cursor: pointer;
  }
`;

const TooltipContainer = styled(SmartFlex)`
  max-width: 300px;
  padding: 8px;
`;
