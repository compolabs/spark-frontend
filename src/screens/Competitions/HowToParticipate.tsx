import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex.tsx";
import { SmartFlex } from "@components/SmartFlex.tsx";
import Text, { TEXT_TYPES } from "@components/Text.tsx";
import { media } from "@themes/breakpoints";

import setting from "./setting.json";

export const HowToParticipate = observer(() => {
  const navigate = useNavigate();
  const steps = [
    {
      title: "Trade Any Available Pairs",
      description: (
        <Text greenLight onClick={() => navigate("/spot")}>
          Trade Now →
        </Text>
      ),
    },
    {
      title: "Minimum Trading Volume",
      description: <Text primary>{setting.minimumTradingVolume}</Text>,
    },
    {
      title: "Best PnL Trader Wins",
      description: (
        <SmartFlex gap="8px">
          <Text greenLight>%184.61</Text>
          <Text secondary>Current best result</Text>
        </SmartFlex>
      ),
    },
  ];

  return (
    <HowToParticipateContainer>
      <HowToParticipateHeader>
        <TitleText type={TEXT_TYPES.H} primary>
          HOW TO PARTICIPATE
        </TitleText>
      </HowToParticipateHeader>
      <StepsContainer>
        {steps.map((el, index) => (
          <SmartFlex key={el.title} gap="8px">
            <PositionBox>{index + 1}</PositionBox>
            <StepsContent>
              <Text primary>{el.title}</Text>
              {el.description}
            </StepsContent>
          </SmartFlex>
        ))}
      </StepsContainer>
    </HowToParticipateContainer>
  );
});

const TitleText = styled(Text)`
  display: flex;
  align-items: center;
`;

const HowToParticipateContainer = styled(SmartFlex)`
  flex-direction: column;
  width: 100%;
`;

const HowToParticipateHeader = styled(Column)`
  width: 100%;
  gap: 10px;
  padding: 32px 0px 16px 0px;
  margin: 0px auto;
  justify-content: space-between;
`;

const StepsContainer = styled(SmartFlex)`
  gap: 24px;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.colors.strokeSecondary};
  width: 100%;

  ${media.mobile} {
    flex-direction: column;
  }
`;

const StepsContent = styled(SmartFlex)`
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
`;

const PositionBox = styled(SmartFlex)`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.accentPrimary};
  border: 1px solid ${({ theme }) => theme.colors.strokeSecondary};
  align-items: center;
  justify-content: center;
  border-radius: 4px;
`;
