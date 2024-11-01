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

import { SpotMarket } from "@entity";

import { MarketTitle } from "./MarketTitle";

interface IProps {
  market: SpotMarket;
}

const SpotMarketRow: React.FC<IProps> = observer(({ market }) => {
  const { tradeStore, mixPanelStore, accountStore } = useStores();
  const navigate = useNavigate();

  const isFavorite = tradeStore.favMarkets.includes(market.symbol);

  const handleFavoriteClick = (e: MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const action = isFavorite ? tradeStore.removeFromFav : tradeStore.addToFav;

    action(market.symbol);
  };

  const isActive = tradeStore.market?.symbol === market.symbol;

  const handleMarketClick = () => {
    mixPanelStore.trackEvent(MIXPANEL_EVENTS.CLICK_CURRENCY_PAIR, {
      user_address: accountStore.address,
      token1: market.baseToken.symbol,
      token2: market.quoteToken.symbol,
    });
    tradeStore.setMarketSelectionOpened(false);
    navigate(`${ROUTES.SPOT}/${market.symbol}`);
  };

  return (
    <Root isActive={isActive} onClick={handleMarketClick}>
      <SmartFlex gap="4px" width="100%" column>
        <Icon alt="Add to Favorite" src={isFavorite ? filledStarIcon : outlineStarIcon} onClick={handleFavoriteClick} />
        <MarketTitle market={market} />
      </SmartFlex>
      <SmartFlex alignSelf="flex-end" justifyContent="flex-end" width="100%">
        <Text color="primary" type={TEXT_TYPES.H} nowrap>
          $ {market.priceUnits.toFormat(2)}
        </Text>
      </SmartFlex>
    </Root>
  );
});

export default SpotMarketRow;

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
