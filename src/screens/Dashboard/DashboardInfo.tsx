import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import CloseIcon from "@assets/icons/close.svg?react";
import InfoFillIcon from "@assets/icons/infoFill.svg?react";

import { useStores } from "@stores";
export const DashboardInfo = observer(() => {
  const { settingsStore } = useStores();
  return (
    <DashboardInfoContainer>
      <TextContainer>
        <InfoFillIcon />
        <TextStyled type={TEXT_TYPES.SUPPORTING_NUMBERS} primary>
          Updating information about your funds in the portfolio may take up to one hour
        </TextStyled>
      </TextContainer>
      <CloseIconStyled onClick={() => settingsStore.setIsInfoDashboardPerHours(true)} />
    </DashboardInfoContainer>
  );
});

const TextContainer = styled(SmartFlex)`
  align-items: center;
  gap: 8px;
  ${media.mobile} {
    align-items: flex-start;
  }
`;

const TextStyled = styled(Text)`
  line-height: 12px;
`;

const DashboardInfoContainer = styled(SmartFlex)`
  background: #332263;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #6743ee;
  text-transform: uppercase;
  align-items: center;
  justify-content: space-between;
`;

const CloseIconStyled = styled(CloseIcon)`
  &:hover {
    cursor: pointer;
  }
`;
