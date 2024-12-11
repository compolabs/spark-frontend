import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { media } from "@themes/breakpoints";

import { useStores } from "@stores";

import { MarketAttribute } from "./MarketAttribute";
import { MarketDataProps } from "./types";

export const MarketDataCard: React.FC<MarketDataProps> = observer(({ attributes }) => {
  const { dashboardStore } = useStores();
  const select = attributes[dashboardStore.activeUserStat];
  const handleClick = (index: number) => {
    dashboardStore.setActiveUserStat(index);
  };
  return (
    <CardWrapper>
      {attributes.map((attribute, index) => (
        <MarketAttribute
          key={index}
          isSelect={select.title === attribute.title}
          onClick={() => handleClick(index)}
          {...attribute}
        />
      ))}
    </CardWrapper>
  );
});

const CardWrapper = styled.article`
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  ${media.mobile} {
    flex-direction: row;
    padding: 4px;
    min-height: auto;
  }
  display: flex;
  flex-direction: column;
  padding: 16px 16px 40px;
  border: 1px solid rgba(46, 46, 46, 1);
  min-width: 240px;
  min-height: 320px;
`;
