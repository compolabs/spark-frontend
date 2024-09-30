import React, { useEffect, useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import { media } from "@themes/breakpoints";

import IOSScreen1Icon from "@assets/pwa/ios-pwa-1.svg?react";
import IOSScreen2Icon from "@assets/pwa/ios-pwa-2.svg?react";
import CircleIcon from "@assets/pwa/ios-pwa-3.svg?react";
import ArrowIcon from "@assets/pwa/ios-pwa-4.svg?react";

import { useMedia } from "@hooks/useMedia";

import { getDeviceInfo } from "@utils/getDeviceInfo";

import { Dialog } from "./Dialog";
import SizedBox from "./SizedBox";
import { SmartFlex } from "./SmartFlex";
import Text, { TEXT_TYPES } from "./Text";

export const PWAModal: React.FC = () => {
  const theme = useTheme();
  const media = useMedia();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const { isAndroid, isIOS, isPWA } = getDeviceInfo();

    if ((!isAndroid && !isIOS) || isPWA || media.desktop) return;

    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <DialogStyled visible={isVisible}>
      <PWAContainer>
        <Text color={theme.colors.greenLight} type={TEXT_TYPES.SUPPORTING}>
          One more thing :)
        </Text>
        <SkipText onClick={handleClose}>SKIP</SkipText>
        <TitleText color={theme.colors.textPrimary} type={TEXT_TYPES.H}>
          Add Sprk.fi app to Homescreen for faster trading
        </TitleText>
        <SizedBox height={64} />
        <DescriptionText color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
          Tap the “Share” button at the bottom of the screen.
        </DescriptionText>
        <SizedBox height={12} />
        <ImageContainer>
          <IOSScreen1Icon />
          <CircleIconStyled />
        </ImageContainer>
        <SizedBox height={24} />
        <DescriptionText color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
          Select “Add to Home Screen”
        </DescriptionText>
        <SizedBox height={12} />
        <ImageContainer>
          <IOSScreen2Icon />
          <ArrowIconStyled />
        </ImageContainer>
      </PWAContainer>
    </DialogStyled>
  );
};

const DialogStyled = styled(Dialog)`
  .rc-dialog-content {
    border-radius: 16px;
    margin: 0 16px;
  }
`;

const PWAContainer = styled(SmartFlex)`
  flex-direction: column;
  align-items: center;
  padding: 18px 24px 34px;
  border-radius: 16px;
`;

const TitleText = styled(Text)`
  font-size: 16px;
  text-align: center;

  margin-top: 20px;

  ${media.mobile} {
    font-size: 16px;
  }
`;

const DescriptionText = styled(Text)`
  text-align: center;

  padding: 0 32px;
`;

const SkipText = styled(Text)`
  position: absolute;
  top: 18px;
  right: 14px;

  cursor: pointer;
`;

const ImageContainer = styled(SmartFlex)`
  position: relative;
`;

const CircleIconStyled = styled(CircleIcon)`
  position: absolute;
  top: 58px;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const ArrowIconStyled = styled(ArrowIcon)`
  position: absolute;
  top: -4px;
  right: -6px;
  transform: translate(-50%, -50%);
`;
