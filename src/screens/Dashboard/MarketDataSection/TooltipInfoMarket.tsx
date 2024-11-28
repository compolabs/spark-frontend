import React, { useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import { SmartFlex } from "@components/SmartFlex.tsx";
import Text from "@components/Text";
import Tooltip from "@components/Tooltip.tsx";

import InfoIcon from "@assets/icons/info.svg?react";

const TooltipInfoMarket = ({ value }: { value: string }) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const ContentData = () => {
    return (
      <ContentDataContainer>
        <Text secondary>In Contracts:</Text> <Text primary>{value}</Text>
      </ContentDataContainer>
    );
  };

  return (
    <Tooltip
      config={{
        placement: "bottom-start",
        trigger: "click",
        visible: isVisible,
        onVisibleChange: setIsVisible,
      }}
      content={<ContentData />}
      rootStyles={{
        paddingTop: 0,
        backgroundColor: theme.colors.accentPrimary,
      }}
    >
      <InfoIconStyled onMouseOut={() => setIsVisible(false)} onMouseOver={() => setIsVisible(true)} />
    </Tooltip>
  );
};

const ContentDataContainer = styled(SmartFlex)`
  padding: 12px 16px;
  gap: 8px;
`;
const InfoIconStyled = styled(InfoIcon)`
  width: 12px;
  height: 12px;

  & > path {
    fill: ${({ theme }) => theme.colors.textDisabled};
  }
  &:hover > path {
    fill: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export default TooltipInfoMarket;
