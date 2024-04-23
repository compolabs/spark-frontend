import React from "react";
import styled from "@emotion/styled";

import Text, { TEXT_TYPES } from "@components/Text";
import { SmartFlex } from "@src/components/SmartFlex";
import { SpotMarket } from "@src/entity";

interface IProps {
  market: SpotMarket;
  iconSize?: 16 | 24;
}

export const MarketTitle = ({ market, iconSize = 16 }: IProps) => {
  return (
    <SmartFlex>
      <SmartFlex alignItems="center">
        <Icon alt="logo" size={iconSize} src={market.baseToken?.logo} />
        <StyleIcon alt="logo" size={iconSize} src={market.quoteToken?.logo} />
      </SmartFlex>
      <Text color="primary" type={TEXT_TYPES.H}>
        {market.symbol}
      </Text>
    </SmartFlex>
  );
};

const Icon = styled.img<{ size?: number }>`
  height: ${({ size }) => size || 16}px;
  width: ${({ size }) => size || 16}px;
  border-radius: 50%;
`;

const StyleIcon = styled(Icon)<{ size?: number }>`
  height: ${({ size }) => size || 16}px;
  width: ${({ size }) => size || 16}px;
  position: relative;
  left: ${({ size }) => (size === 24 ? -8 : -6)}px;
`;
