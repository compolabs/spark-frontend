import React from "react";
import styled from "@emotion/styled";

import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";

import { SpotMarket } from "@entity";

interface IProps {
  market: SpotMarket;
  iconSize?: 16 | 24;
}

export const MarketTitle = ({ market, iconSize = 16 }: IProps) => {
  return (
    <MarketTitleContainer size={iconSize * 2}>
      <SmartFlex width="fit-content">
        <Icon alt="logo" size={iconSize} src={market.baseToken?.logo} />
        <StyleIcon alt="logo" size={iconSize} src={market.quoteToken?.logo} />
      </SmartFlex>
      <StyledText color="primary" type={TEXT_TYPES.H}>
        {market.symbol}
      </StyledText>
    </MarketTitleContainer>
  );
};

const MarketTitleContainer = styled(SmartFlex)<{ size: number }>`
  display: grid;
  grid-template-columns: ${({ size }) => size}px 1fr;
  gap: 4px;
  align-items: center;
`;

const Icon = styled.img<{ size?: number }>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  border-radius: 50%;
`;

const StyleIcon = styled(Icon)<{ size: number }>`
  position: relative;
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  left: ${({ size }) => (size === 24 ? -8 : -6)}px;
`;

const StyledText = styled(Text)`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;
