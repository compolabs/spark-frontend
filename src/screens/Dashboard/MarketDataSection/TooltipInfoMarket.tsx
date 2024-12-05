import React, { useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import { Column } from "@components/Flex";
import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";
import Tooltip from "@components/Tooltip";

import InfoIcon from "@assets/icons/info.svg?react";

const TooltipInfoMarket = ({ value }: { value: string }) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const ContentData = () => {
    return (
      <ContentDataContainer>
        <SmartFlex gap="8px">
          <TextTitle secondary>In Contracts:</TextTitle> <Text primary>{value}</Text>{" "}
        </SmartFlex>
        <TotalContainer>
          <TextTitle secondary>Total Value:</TextTitle> <Text primary>{value}</Text>{" "}
        </TotalContainer>
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

const ContentDataContainer = styled(Column)`
  padding: 12px 16px;
  gap: 8px;
`;

const TextTitle = styled(Text)`
  width: 102px;
`;

const TotalContainer = styled(SmartFlex)`
  border-top: 1px solid ${({ theme }) => theme.colors.borderPrimary};
  gap: 8px;
  width: 100%;
  padding-top: 4px;
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
