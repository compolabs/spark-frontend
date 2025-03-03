import React, { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step, TooltipRenderProps } from "react-joyride";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import ArrowUpRightIcon from "@assets/icons/arrowUpRight.svg?react";
import CloseIcon from "@assets/icons/close.svg?react";
import WalletIcon from "@assets/icons/wallet.svg?react";

import { useStores } from "@stores";

import { WALLET_DOCS_LINK } from "@constants";

import { SmartFlex } from "./SmartFlex";
import Text from "./Text";

const ONBOARDING_STEPS: Step[] = [
  {
    content: "",
    disableBeacon: true,
    hideCloseButton: true,
    hideFooter: true,
    placement: "bottom",
    spotlightClicks: true,
    spotlightPadding: 10,
    styles: {
      options: {
        zIndex: 20000,
      },
    },
    target: "[data-connect-button]",
    title: "Menu",
  },
];

export const Onboarding: React.FC = () => {
  const { settingsStore } = useStores();
  const theme = useTheme();

  const [isRunning, setIsRunning] = useState(() => !settingsStore.isCompleteOnboardingProcess);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.SKIPPED || status === STATUS.FINISHED) {
      setIsRunning(false);
      settingsStore.setIsCompletedOnboardingProcess(true);
    }
  };

  const handleConnectWalletClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-connect-button]")) {
      setIsRunning(false);
      settingsStore.setIsCompletedOnboardingProcess(true);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleConnectWalletClick);
    return () => document.removeEventListener("click", handleConnectWalletClick);
  }, []);

  return (
    <Joyride
      callback={handleJoyrideCallback}
      disableOverlayClose={false}
      floaterProps={{
        styles: {
          arrow: {
            color: theme.colors.fillAccentSecondary,
            length: 6,
            spread: 10,
            border: `1px solid ${theme.colors.fillAccentSecondary}`,
          },
        },
      }}
      run={isRunning}
      steps={ONBOARDING_STEPS}
      tooltipComponent={Tooltip}
      continuous
    />
  );
};

const Tooltip: React.FC<TooltipRenderProps> = ({ tooltipProps, primaryProps }) => {
  const handleClickLearnMore = () => {
    window.open(WALLET_DOCS_LINK, "_blank");
  };

  return (
    <TooltipContainer {...tooltipProps}>
      <TooltipHeader center="y" justifyContent="space-between">
        <SmartFlex center="y" gap="8px">
          <WalletIcon />
          <Text color="inherit" type="CP_Body_16_Medium">
            Connect Your Wallet
          </Text>
        </SmartFlex>
        <CloseIconStyled onClick={(e) => primaryProps.onClick(e as any)} />
      </TooltipHeader>
      <TooltipContent>
        <Text color="inherit" type="CP_Body_16_Medium">
          Seamless interaction with V12 smart contracts and managing your assets
        </Text>
        <LearnMoreButton onClick={handleClickLearnMore}>
          <Text color="inherit" type="CP_Body_16_Medium">
            Learn more
          </Text>
          <ArrowUpRightIcon />
        </LearnMoreButton>
      </TooltipContent>
    </TooltipContainer>
  );
};

const TooltipContainer = styled(SmartFlex)`
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.fillAccentSecondary};
  border: 1px solid ${({ theme }) => theme.colors.strokePrimary};
  color: ${({ theme }) => theme.colors.textIconPrimary};

  max-width: 340px;
`;

const TooltipHeader = styled(SmartFlex)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.strokePrimary};
  color: ${({ theme }) => theme.colors.textIconPrimary};

  padding: 16px;
`;

const TooltipContent = styled(SmartFlex)`
  flex-direction: column;
  gap: 8px;
  padding: 12px 18px;
`;

const LearnMoreButton = styled(SmartFlex)`
  gap: 4px;
  align-items: center;
  color: ${({ theme }) => theme.colors.blueVioletStrong};
`;

const CloseIconStyled = styled(CloseIcon)`
  width: 10px;
  height: 10px;

  path {
    fill: ${({ theme }) => theme.colors.textIconPrimary};
  }

  cursor: pointer;
`;
