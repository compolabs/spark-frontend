import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import arrowLeft from "@assets/icons/arrowLeft.svg";
import arrowUp from "@assets/icons/arrowUp.svg";
import SwitchIcon from "@assets/icons/switch.svg?react";

import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";

import MarketStatisticsBarSkeletonWrapper from "../../components/Skeletons/MarketStatisticsBarSkeletonWrapper";

import MarketStatistics from "./MarketStatistics";

interface IProps {
  isChartOpen?: boolean;
  onSwitchClick?: () => void;
}

export const MARKET_SELECTOR_ID = "market-selector";

const MarketStatisticsBar: React.FC<IProps> = observer(({ isChartOpen, onSwitchClick }) => {
  const { tradeStore } = useStores();
  const media = useMedia();

  const handleBack = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onSwitchClick?.();
  };

  const handleOpenMarketSidebar = () => {
    tradeStore.setMarketSelectionOpened(!tradeStore.marketSelectionOpened);
  };

  const handleSwitchClick = () => {
    if (isChartOpen || tradeStore.marketSelectionOpened) return;

    onSwitchClick?.();
  };

  const renderLeftIcons = () => {
    if (isChartOpen) {
      return <Icon alt={tradeStore.market?.baseToken.symbol} src={arrowLeft} onClick={handleBack} />;
    }

    return (
      <>
        <Icon alt={tradeStore.market?.baseToken.symbol} src={tradeStore.market?.baseToken.logo} />
        <Icon
          alt={tradeStore.market?.quoteToken.symbol}
          src={tradeStore.market?.quoteToken.logo}
          style={{ marginLeft: -16 }}
        />
      </>
    );
  };

  const renderMarketSelector = () => {
    if (!tradeStore.market) return;

    return (
      <MarketSelect
        focused={tradeStore.marketSelectionOpened}
        id={MARKET_SELECTOR_ID}
        onClick={handleOpenMarketSidebar}
      >
        <SmartFlex gap="8px" center>
          {renderLeftIcons()}
          <SmartFlex gap="4px" center>
            <StyledText type={TEXT_TYPES.H} primary>
              {tradeStore.market?.symbol}
            </StyledText>
            <StyledArrow alt="arrow" src={arrowUp} />
          </SmartFlex>
        </SmartFlex>
      </MarketSelect>
    );
  };

  return (
    <MarketStatisticsBarSkeletonWrapper isReady={tradeStore.initialized}>
      <Root>
        {renderMarketSelector()}
        {media.desktop && <MarketStatistics />}
        <SwitchContainer isVisible={!isChartOpen && !tradeStore.marketSelectionOpened} onClick={handleSwitchClick}>
          <SwitchIcon />
        </SwitchContainer>
      </Root>
    </MarketStatisticsBarSkeletonWrapper>
  );
});

export default MarketStatisticsBar;

const Root = styled.div`
  display: grid;
  grid-template-columns: minmax(min-content, 280px) minmax(300px, 1fr) 0;
  grid-template-rows: 1fr;
  grid-column-gap: 0px;
  grid-row-gap: 0px;

  height: 48px;
  width: 100%;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 10px;

  ${media.mobile} {
    grid-template-columns: 1fr 0;
    height: 40px;
    min-height: 40px;
  }
`;
const Icon = styled.img`
  border-radius: 50%;
  height: 24px;
  width: 24px;
`;

const StyledArrow = styled.img`
  width: 24;
  height: 24;
`;

const MarketSelect = styled.div<{
  focused?: boolean;
  disabled?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  max-width: 280px;
  height: 48px;
  gap: 4px;
  cursor: pointer;

  ${media.mobile} {
    height: 40px;
  }

  ${({ focused, theme }) =>
    focused && {
      background: theme.colors.bgSecondary,
      borderRadius: "10px 0 0 10px",
    }}

  ${StyledArrow} {
    cursor: pointer;
    transition: 0.4s;
    transform: ${({ focused }) => (focused ? "rotate(-180deg)" : "rotate(0deg)")};
  }

  :hover {
    ${StyledArrow} {
      transform: ${({ focused, disabled }) =>
        focused ? "rotate(-180)" : disabled ? "rotate(0deg)" : "rotate(-90deg)"};
    }
  }

  ${media.mobile} {
    max-width: unset;
    border-radius: ${({ focused }) => (focused ? "10px" : "unset")};
  }
`;

const StyledText = styled(Text)`
  width: max-content;
`;

const SwitchContainer = styled(SmartFlex)<{ isVisible?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  align-self: center;
  justify-self: flex-end;
  margin-right: 8px;

  border-radius: 100%;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary};

  ${media.desktop} {
    display: none;
  }

  ${media.mobile} {
    opacity: ${({ isVisible }) => (isVisible ? "1" : "0")};
    transition: opacity 250ms;
  }
`;
