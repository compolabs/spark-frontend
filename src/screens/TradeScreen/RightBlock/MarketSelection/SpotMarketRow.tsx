import React, { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Text, { TEXT_TYPES } from "@components/Text";
import outlineStarIcon from "@src/assets/icons/star.svg";
import filledStarIcon from "@src/assets/icons/yellowStar.svg";
import { SmartFlex } from "@src/components/SmartFlex";
import { SpotMarket } from "@src/entity";
import { useStores } from "@stores";

import { MarketTitle } from "./MarketTitle";
import BN from "@src/utils/BN.ts";
import { DEFAULT_DECIMALS } from "@src/constants";

interface IProps {
  market: SpotMarket;
}

const SpotMarketRow: React.FC<IProps> = observer(({ market }) => {
  const { oracleStore } = useStores();
  const { tradeStore } = useStores();
  const navigate = useNavigate();

  const isFavorite = tradeStore.favMarkets.includes(market.symbol);

  const tokenPrice = BN.formatUnits(
    oracleStore.getTokenIndexPrice(market.baseToken.priceFeed),
    DEFAULT_DECIMALS,
  ).toFormat(2);
  const handleFavoriteClick = (e: MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const action = isFavorite ? tradeStore.removeFromFav : tradeStore.addToFav;

    action(market.symbol);
  };

  const isActive = tradeStore.market?.symbol === market.symbol;

  return (
    <Root
      isActive={isActive}
      onClick={() => {
        tradeStore.setMarketSelectionOpened(false);
        tradeStore.setIsPerp(false);
        navigate(`/${market.symbol}`);
      }}
    >
      <SmartFlex gap="4px" width="100%" column>
        <Icon alt="Add to Favorite" src={isFavorite ? filledStarIcon : outlineStarIcon} onClick={handleFavoriteClick} />
        <MarketTitle market={market} />
      </SmartFlex>
      <SmartFlex alignSelf="flex-end" justifyContent="flex-end" width="100%">
        <Text color="primary" type={TEXT_TYPES.H} nowrap>
          $ {tokenPrice}
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

const StyleIcon = styled(Icon)`
  position: relative;
  left: -6px;
`;
