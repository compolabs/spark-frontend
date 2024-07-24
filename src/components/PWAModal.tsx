import React, { useEffect, useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import IOSScreen1Icon from "@src/assets/pwa/ios-pwa-1.svg?react";
import IOSScreen2Icon from "@src/assets/pwa/ios-pwa-2.svg?react";
import CircleIcon from "@src/assets/pwa/ios-pwa-3.svg?react";
import ArrowIcon from "@src/assets/pwa/ios-pwa-4.svg?react";
import { media } from "@src/themes/breakpoints";
import { getDeviceInfo } from "@src/utils/getDeviceInfo";

import { Dialog } from "./Dialog";
import SizedBox from "./SizedBox";
import { SmartFlex } from "./SmartFlex";
import Text, { TEXT_TYPES } from "./Text";

export const PWAModal: React.FC = () => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const { isAndroid, isIOS, isPWA } = getDeviceInfo();

    if ((!isAndroid && !isIOS) || isPWA) return;

    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <DialogStyled visible={isVisible}>
      <PWAContainer>
        <GreetingText color={theme.colors.greenLight}>One more thing :)</GreetingText>
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

const GreetingText = styled(Text)`
  font-size: 12px;

  ${media.mobile} {
    font-size: 12px;
  }
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
  font-size: 12px;
  text-align: center;

  padding: 0 32px;

  ${media.mobile} {
    font-size: 12px;
  }
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
