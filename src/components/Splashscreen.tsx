import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import CheckIcon from "@assets/icons/check.svg?react";
import LogoIcon from "@assets/icons/logo-small.svg?react";
import WalletIcon from "@assets/icons/wallet.svg?react";
import spacemanImage from "@assets/images/spaceman.webp";
import splashScreenOrderbookIcon from "@assets/splash/splash-screen-orderbook.svg";
import splashScreenSwapIcon from "@assets/splash/splash-screen-swap.svg";

import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";

import Button from "./Button";
import { Onboarding, Step } from "./Onboarding";
import { SmartFlex } from "./SmartFlex";
import Text, { TEXT_TYPES } from "./Text";

enum SPLASH_SCREEN_TYPE {
  SWAP,
  ORDERBOOK,
}

interface SplashScreenInfo {
  name: string;
  desc: string;
  icon: string;
  type: SPLASH_SCREEN_TYPE;
}

const SPLASH_SCREEN_INFO: SplashScreenInfo[] = [
  {
    name: "Swap",
    desc: "Buy and sell assets at market price",
    icon: splashScreenSwapIcon,
    type: SPLASH_SCREEN_TYPE.SWAP,
  },
  {
    name: "Orderbook",
    desc: "More options for experienced traders",
    icon: splashScreenOrderbookIcon,
    type: SPLASH_SCREEN_TYPE.ORDERBOOK,
  },
];

const TYPE_ROUTE_MAP = {
  [SPLASH_SCREEN_TYPE.SWAP]: "/swap",
  [SPLASH_SCREEN_TYPE.ORDERBOOK]: "/trade",
};

export const SplashScreen: React.FC = observer(() => {
  const media = useMedia();
  const navigate = useNavigate();
  const [mode, setMode] = useState(SPLASH_SCREEN_TYPE.SWAP);
  const { settingsStore } = useStores();

  const [isSplashScreenVisible, setSplashScreenVisible] = useState(!settingsStore.isCompleteOnboardingProcess);
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);

  const onboardingSteps = mode === SPLASH_SCREEN_TYPE.SWAP ? ONBOARDING_SWAP_STEPS : ONBOARDING_TRADE_STEPS;

  const handleModeClick = (newMode: SPLASH_SCREEN_TYPE) => {
    setMode(newMode);
  };

  const handleGoToMode = (newMode: SPLASH_SCREEN_TYPE) => {
    handleGoClick(newMode);
  };

  const handleGoClick = (newMode?: SPLASH_SCREEN_TYPE) => {
    navigate(TYPE_ROUTE_MAP[newMode ?? mode]);
    setSplashScreenVisible(false);
    setIsOnboardingVisible(true);
  };

  const handleOnComplete = () => {
    setIsOnboardingVisible(false);
    settingsStore.setIsCompletedOnboardingProcess(true);
  };

  const renderModeButton = (info: SplashScreenInfo) => {
    const isSelected = mode === info.type;

    return (
      <ModeButtonContainer
        key={info.name}
        isSelected={isSelected}
        onClick={() => handleModeClick(info.type)}
        onDoubleClick={() => handleGoToMode(info.type)}
      >
        <img alt={info.name} src={info.icon} />
        <SmartFlex gap="6px" column>
          <Text>{info.name}</Text>
          <Text>{info.desc}</Text>
        </SmartFlex>
        <SelectedLabel isSelected={isSelected}>
          <CheckIcon />
        </SelectedLabel>
      </ModeButtonContainer>
    );
  };

  return (
    <>
      {isSplashScreenVisible && (
        <Root>
          <SelectModeContainer>
            <TitleContainer>
              <SmartFlex gap="8px" center>
                <DescriptionStyled>Hey, and welcome to</DescriptionStyled>
                <LogoIcon />
              </SmartFlex>
              <TitleStyled>Select trading mode to begin</TitleStyled>
            </TitleContainer>
            <ModeContainer>{SPLASH_SCREEN_INFO.map(renderModeButton)}</ModeContainer>
            <StyledButton green onClick={() => handleGoClick()}>
              <ButtonText type={TEXT_TYPES.TITLE} primary>
                Let&apos;s go!
              </ButtonText>
            </StyledButton>
          </SelectModeContainer>
          {!media.mobile && (
            <BannerContainer>
              <BannerImage src={spacemanImage} />
            </BannerContainer>
          )}
        </Root>
      )}
      {isOnboardingVisible && <Onboarding steps={onboardingSteps} onComplete={handleOnComplete} />}
    </>
  );
});

const ONBOARDING_TRADE_STEPS: Step[] = [
  {
    desktopKey: "connect-desktop",
    mobileKey: "connect-mobile",
    desc: "Let's connect your wallet",
    icon: WalletIcon,
  },
  {
    desktopKey: "mint-desktop",
    mobileKey: "mint-mobile",
    beforeAction: (media) => {
      if (media.desktop) return;

      // Open mobile menu
      const el = document.querySelector<HTMLElement>("[data-onboarding='menu-mobile']");
      el?.click();
    },
    desc: "Mint some test tokens in Faucet",
  },
  {
    desktopKey: "assets-desktop",
    mobileKey: "assets-mobile",
    desc: "Deposit assets to start trading",
  },
  {
    desktopKey: "trade-desktop",
    mobileKey: "trade-mobile",
    beforeAction: (media) => {
      if (media.desktop) return;

      // Open mobile menu
      const el = document.querySelector<HTMLElement>("[data-onboarding='menu-mobile']");
      el?.click();
    },
    desc: "Start trading",
  },
];

const ONBOARDING_SWAP_STEPS: Step[] = [
  {
    desktopKey: "connect-desktop",
    mobileKey: "connect-mobile",
    desc: "Let's connect your wallet",
    icon: WalletIcon,
  },
  {
    desktopKey: "mint-desktop",
    mobileKey: "mint-mobile",
    beforeAction: (media) => {
      if (media.desktop) return;

      // Open mobile menu
      const el = document.querySelector<HTMLElement>("[data-onboarding='menu-mobile']");
      el?.click();
    },
    desc: "Mint some test tokens in Faucet",
  },
  {
    desktopKey: "assets-desktop",
    mobileKey: "assets-mobile",
    desc: "Deposit assets to start trading",
  },
  // {
  //   desktopKey: "swap-desktop",
  //   mobileKey: "swap-mobile",
  //   beforeAction: (media) => {
  //     if (media.desktop) return;
  //
  //     // Close mobile menu
  //     const el = document.querySelector<HTMLElement>("[data-onboarding='menu-mobile']");
  //     el?.click();
  //   },
  //   desc: "Start trading",
  // },
];

const Root = styled(SmartFlex)`
  position: fixed;

  gap: 4px;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;

  background-color: ${({ theme }) => theme.colors.overlayBackground};
  backdrop-filter: blur(16px);

  z-index: 1000;
`;

const SelectModeContainer = styled(SmartFlex)`
  flex-direction: column;
  align-items: center;

  padding: 38px;

  width: 420px;
  height: 500px;

  border-radius: 16px;

  gap: 42px;

  background-color: ${({ theme }) => theme.colors.bgPrimary};
`;

const TitleContainer = styled(SmartFlex)`
  flex-direction: column;
  gap: 8px;
`;

const DescriptionStyled = styled(Text)`
  font-family: Space Grotesk;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  text-align: center;

  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TitleStyled = styled(Text)`
  width: 240px;

  font-family: Space Grotesk;
  font-size: 32px;
  font-weight: 400;
  line-height: 32px;
  text-align: center;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ModeContainer = styled(SmartFlex)`
  flex-direction: column;
  gap: 8px;

  z-index: 1;
`;

const ModeButtonContainer = styled(SmartFlex)<{ isSelected?: boolean }>`
  padding: 11px 12px;
  gap: 16px;
  align-items: center;
  background-color: #151515;
  border-radius: 8px;

  position: relative;

  cursor: pointer;

  background-clip: padding-box;
  border: solid 1px transparent;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -1;
    margin: -1px;
    border-radius: inherit;
    opacity: ${({ isSelected }) => (isSelected ? 1 : 0)};
    background: linear-gradient(165deg, #00e388 29.88%, #00e388 41.1%, #f3aa3c 83.87%, #f33c94 100%);
    transition: opacity 250ms ease;
  }
`;

const SelectedLabel = styled(SmartFlex)<{ isSelected?: boolean }>`
  position: absolute;
  top: -1px;
  right: -1px;

  align-items: center;
  justify-content: center;

  height: 24px;
  width: 24px;

  border-radius: 0 8px 0 8px;
  background-color: ${({ theme }) => theme.colors.greenLight};
  opacity: ${({ isSelected }) => (isSelected ? 1 : 0)};
  transition: opacity 250ms ease;
`;

const BannerContainer = styled(SmartFlex)`
  width: 420px;
  height: 500px;
`;

const BannerImage = styled.img`
  object-fit: cover;
  border-radius: 16px;
  -webkit-user-drag: none;
`;

const ButtonText = styled(Text)`
  font-weight: 500;
`;

const StyledButton = styled(Button)`
  width: 224px;
  height: 40px;

  border-radius: 16px;
`;
