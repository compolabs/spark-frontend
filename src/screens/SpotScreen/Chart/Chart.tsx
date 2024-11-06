import React from "react";
import styled from "@emotion/styled";

import { media } from "@themes/breakpoints";

import TradingViewWidget from "./TradingViewWidget";

const Chart: React.FC = () => {
  return (
    <Root>
      <TradingViewWidget />
    </Root>
  );
};

export default Chart;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 3;

  ${media.mobile} {
    min-height: 412px;
    max-height: 412px;
  }

  & > * {
    width: 100%;
    height: 100%;
  }
`;
