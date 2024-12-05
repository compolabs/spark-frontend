import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import ArrowLongIcon from "@assets/icons/arrowLong.svg?react";
import ArrowRightIcon from "@assets/icons/arrowRight.svg?react";

import { getDeviceInfo } from "@utils/getDeviceInfo";

import { MarketAttributeProps } from "./types";

export const MarketAttribute: React.FC<MarketAttributeProps> = observer(
  ({ title, value, period, change, isSelect, onClick }) => {
    const isHaveRange = parseFloat(change.value) !== 0;
    const { isMobile } = getDeviceInfo();
    return (
      <AttributeWrapper isSelect={isSelect} onClick={onClick}>
        <AttributeContent column>
          <AttributeHeader>
            <Text type={TEXT_TYPES.BODY} secondary>
              {title}
            </Text>
            {/*{isShowDetails && <TooltipInfoMarket value={value} />}*/}
            {!isMobile && (
              <Text type={TEXT_TYPES.BODY} disabled>
                {period}
              </Text>
            )}
          </AttributeHeader>
          <Text type={TEXT_TYPES.H} primary>
            {value}
          </Text>
          <ChangeContainer>
            {isHaveRange && (
              <>
                <Text primary>{change.value}</Text>
                <MetricsPercentage>
                  <DirectionIcon direction={change.direction} />
                  <TextPercentage direction={change.direction}>{change.percentage}</TextPercentage>
                </MetricsPercentage>
              </>
            )}
          </ChangeContainer>
        </AttributeContent>
        {isSelect && !isMobile && <ArrowRightIcon />}
      </AttributeWrapper>
    );
  },
);

const ChangeContainer = styled(SmartFlex)`
  height: 14px;
  gap: 8px;
`;

const TextPercentage = styled(Text)<{ direction: string }>`
  color: ${({ direction }) => (direction === "up" ? "#04E78C" : "#E80247")};
`;

const AttributeWrapper = styled.section<{ isSelect: boolean }>`
  border-radius: ${({ isSelect }) => (isSelect ? "4px" : "0px")};
  background: ${({ isSelect, theme }) => (isSelect ? theme.colors.accentPrimary : "transparent")};
  border-bottom: 1px solid ${({ isSelect, theme }) => (isSelect ? theme.colors.borderPrimary : "transparent")};
  ${media.mobile} {
    border: 1px solid ${({ isSelect, theme }) => (isSelect ? theme.colors.borderPrimary : "transparent")};
  }
  display: flex;
  height: 88px;
  align-items: center;
  gap: 4px;
  padding: 16px;
  justify-content: space-between;
  &:hover {
    cursor: pointer;
  }
`;

const AttributeContent = styled(SmartFlex)`
  gap: 4px;
`;

const AttributeHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.24px;
  line-height: 1;
`;

const MetricsPercentage = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const DirectionIcon = styled(ArrowLongIcon)`
  width: 8px;
  height: 8px;
  color: ${({ direction }) => (direction === "up" ? "#04E78C" : "#E80247")};
  transform: ${({ direction }) => (direction === "down" ? "rotate(-180deg)" : "rotate(0deg)")};
`;
