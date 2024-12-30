import React, { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";

import outlineStarIcon from "@assets/icons/star.svg";
import filledStarIcon from "@assets/icons/yellowStar.svg";

import { useStores } from "@stores";
import { MIXPANEL_EVENTS } from "@stores/MixPanelStore";

import { ROUTES } from "@constants";

import { BaseMarket, SpotMarket } from "@entity";

interface Props {
  market: BaseMarket;
  showLeverage?: boolean;
  showPriceChange?: boolean;
}

const MarketRow: React.FC<Props> = observer(({ market, showLeverage = false, showPriceChange = false }) => {
  const { marketStore, mixPanelStore, accountStore } = useStores();
  const navigate = useNavigate();

  const isFavorite = marketStore.favMarkets.includes(market.symbol);

  const handleFavoriteClick = (e: MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.stopPropagation();

    marketStore.toggleFavMarket(market.symbol);
  };

  const isActive = marketStore.market?.symbol === market.symbol;

  const handleMarketClick = () => {
    const route = SpotMarket.isInstance(market) ? ROUTES.SPOT : ROUTES.PERP;

    mixPanelStore.trackEvent(MIXPANEL_EVENTS.CLICK_CURRENCY_PAIR, {
      user_address: accountStore.address,
      token1: market.baseToken.symbol,
      token2: market.quoteToken.symbol,
    });
    marketStore.setMarketSelectionOpened(false);
    navigate(`${route}/${market.symbol}`);
  };

  return (
    <Root isActive={isActive} onClick={handleMarketClick}>
      <SmartFlex gap="4px" width="100%" column>
        <SmartFlex gap="4px">
          <Icon
            alt="Add to Favorite"
            src={isFavorite ? filledStarIcon : outlineStarIcon}
            onClick={handleFavoriteClick}
          />
          {showLeverage && (
            <LeverageText center>
              <Text type={TEXT_TYPES.SUPPORTING} secondary>
                10x
              </Text>
            </LeverageText>
          )}
        </SmartFlex>
        <SmartFlex>
          <SmartFlex>
            <MainIcon alt="logo" src={market.baseToken?.logo} />
            <StyledIcon alt="logo" src={market.quoteToken?.logo} />
          </SmartFlex>
          <Text color="primary" type={TEXT_TYPES.H}>
            {market.symbol}
          </Text>
        </SmartFlex>
      </SmartFlex>
      <SmartFlex height="100%" justifyContent="flex-end" width="100%" column>
        {showPriceChange && (
          <PriceChangeContainer alignSelf="flex-end" center="y" gap="4px" isPositive>
            <PriceChangeIcon viewBox="0 0 24 24" />
            <Text type={TEXT_TYPES.BODY}>-%</Text>
          </PriceChangeContainer>
        )}
        <SmartFlex alignSelf="flex-end">
          <Text color="primary" type={TEXT_TYPES.H} nowrap>
            $ {market.priceUnits.toFormat(2)}
          </Text>
        </SmartFlex>
      </SmartFlex>
    </Root>
  );
});

export default MarketRow;

const Root = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSecondary};
  box-sizing: border-box;
  cursor: pointer;
  background: ${({ isActive, theme }) => (isActive ? theme.colors.borderSecondary : "transparent")};

  :hover {
    background: ${({ theme }) => theme.colors.borderSecondary};
  }
`;

const Icon = styled.img`
  height: 16px;
  width: 16px;
  border-radius: 50%;
`;

const StyledIcon = styled(Icon)`
  position: relative;
  left: -6px;
`;

const LeverageText = styled(SmartFlex)`
  border: 1px solid ${({ theme }) => theme.colors.iconSecondary};
  border-radius: 4px;
  height: 16px;
  width: 25px;
`;

const PriceChangeIcon = styled.svg`
  transform: rotate(90deg);
  height: 12px;
  width: 12px;
`;

const PriceChangeContainer = styled(SmartFlex)<{ isPositive: boolean }>`
  ${Text} {
    color: ${({ theme, isPositive }) => (isPositive ? theme.colors.greenLight : theme.colors.redLight)};
  }

  ${PriceChangeIcon} {
    path {
      fill: ${({ theme, isPositive }) => (isPositive ? theme.colors.greenLight : theme.colors.redLight)};
    }
  }
`;

const MainIcon = styled(Icon)`
  z-index: 9;
`;
