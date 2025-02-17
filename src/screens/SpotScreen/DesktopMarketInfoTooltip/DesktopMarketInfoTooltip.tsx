import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import Tooltip from "@components/Tooltip";

export interface MarketInfoItem {
  title: string;
  value: string | number | undefined;
  icon?: JSX.Element;
  tooltip?: JSX.Element;
}

interface DesktopMarketInfoTooltipProps {
  marketData: MarketInfoItem;
}
const DesktopMarketInfoTooltip: React.FC<DesktopMarketInfoTooltipProps> = observer(({ marketData }) => {
  const theme = useTheme();

  return (
    <Tooltip
      key={marketData.title}
      config={{
        placement: "bottom-start",
        trigger: "hover",
      }}
      content={<TooltipContainer>{marketData?.tooltip}</TooltipContainer>}
    >
      <SmartFlex key={marketData.title}>
        <SizedBox height={30} style={{ background: theme.colors.bgPrimary, margin: "0 8px" }} width={1} />
        <Column>
          <Text type={TEXT_TYPES.SUPPORTING}>{marketData.title}</Text>
          <SizedBox height={4} />
          <SmartFlex>
            <SmartFlexStyled>
              <Text type={TEXT_TYPES.BODY} primary>
                {marketData.value}
              </Text>
              {marketData?.icon}
            </SmartFlexStyled>
          </SmartFlex>
        </Column>
      </SmartFlex>
    </Tooltip>
  );
});

export default DesktopMarketInfoTooltip;

const SmartFlexStyled = styled(SmartFlex)`
  justify-content: center;
  align-items: center;
  gap: 2px;
`;

const TooltipContainer = styled(SmartFlex)`
  max-width: 300px;
  padding: 8px;
`;
