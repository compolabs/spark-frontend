import React from "react";
import styled from "@emotion/styled";

import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";

import { SpotMarket } from "@entity";

interface MarketSymbolProps {
  market: SpotMarket;
  iconSize?: 16 | 24;
}

export const MarketSymbol = ({ market, iconSize = 16 }: MarketSymbolProps) => {
  return (
    <MarketTitleContainer size={iconSize * 2}>
      <SmartFlex width="fit-content">
        <MainIcon alt="logo" size={iconSize} src={market.baseToken?.logo} />
        <StyleIcon alt="logo" size={iconSize} src={market.quoteToken?.logo} />
      </SmartFlex>
      <StyledText color="primary" type="BUTTON">
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

const MainIcon = styled(Icon)`
  z-index: 9;
`;
