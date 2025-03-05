import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";

import ArrowRightIcon from "@assets/icons/arrowRightNew.svg?react";
import CloseIcon from "@assets/icons/close.svg?react";
import appStoreImg from "@assets/onboarding/app-store.webp";
import fueletImg from "@assets/onboarding/fuelet.webp";
import googlePlayImg from "@assets/onboarding/google-play.webp";
import onboardingEcosystemImg from "@assets/onboarding/onboarding-ecosystem.webp";

import Sheet from "../Sheet";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppStoreSheet: React.FC<Props> = ({ isOpen, onClose }) => {
  const theme = useTheme();

  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <HeaderContainer>
        <Text color={theme.colors.textIconPrimary} type="CP_Header_18_Medium" uppercase>
          Improve your experience
        </Text>
        <CloseIconStyled onClick={onClose} />
      </HeaderContainer>
      <TextContentContainer>
        <Text color="inherit" type="CP_Body_16_Medium">
          For the best mobile UX, open V12 in the Fuelet wallet browser
        </Text>
      </TextContentContainer>
      <ImageContentContainer justifyContent="space-between">
        <img src={onboardingEcosystemImg} />
        <SmartFlex gap="48px" column>
          <img src={fueletImg} width="110" />

          <SmartFlex gap="8px" column>
            <img src={appStoreImg} />
            <img src={googlePlayImg} />
          </SmartFlex>
        </SmartFlex>
      </ImageContentContainer>
      <FooterContainer justifyContent="flex-end">
        <SkipButton onClick={onClose}>
          <Text color="inherit" type="CP_Body_16_Medium">
            Skip for now
          </Text>
          <ArrowRightIcon />
        </SkipButton>
      </FooterContainer>
    </Sheet>
  );
};

const HeaderContainer = styled(SmartFlex)`
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.strokePrimary};
`;

const CloseIconStyled = styled(CloseIcon)`
  width: 14px;
  height: 14px;

  path {
    fill: ${({ theme }) => theme.colors.textIconPrimary};
  }

  cursor: pointer;
`;

const TextContentContainer = styled(SmartFlex)`
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.strokePrimary};
  color: ${({ theme }) => theme.colors.textIconPrimary};
`;

const ImageContentContainer = styled(SmartFlex)`
  padding: 24px 24px 0;
`;

const FooterContainer = styled(SmartFlex)`
  width: 100%;
  padding: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.strokePrimary};
`;

const SkipButton = styled(SmartFlex)`
  cursor: pointer;
  align-items: center;
  gap: 8px;

  color: ${({ theme }) => theme.colors.blueVioletStrong};
`;
