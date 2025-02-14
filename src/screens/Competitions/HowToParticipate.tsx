import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";
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
        <TitleText primary>How to participate</TitleText>
      </HowToParticipateHeader>
      <StepsContainer>
        {steps.map((el) => (
          <SmartFlex key={el.title} gap="8px">
            <StepsContent>
              <Text primary>{el.title}</Text>
            </StepsContent>
          </SmartFlex>
        ))}
      </StepsContainer>
      <Text>
        Prizes will be distributed directly to the winners&#39; wallets connected to their participating V12 account
        shortly after the competition ends
      </Text>
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
  padding: 0px 0px 16px 0px;
  margin: 0px auto;
  justify-content: space-between;
`;

const StepsContainer = styled(SmartFlex)`
  gap: 24px;
  width: 100%;
  padding-bottom: 16px;

  ${media.mobile} {
    gap: 8px;
    flex-direction: column;
  }
`;

const StepsContent = styled(SmartFlex)`
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.accentPrimary};
  padding: 16px 24px;
  ${media.mobile} {
    width: 100%;
  }
`;
