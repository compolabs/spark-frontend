import React, { useLayoutEffect, useRef, useState } from "react";
import styled from "@emotion/styled";

import { media } from "@themes/breakpoints";

import arrowIcon from "@assets/icons/onboardingArrow.svg";

import { IMedia, useMedia } from "@hooks/useMedia";

import Button from "./Button";
import { SmartFlex } from "./SmartFlex";
import Text from "./Text";

export interface Step {
  desktopKey: string;
  mobileKey: string;
  desc: string;
  beforeAction?: (media: IMedia) => void;
}

interface Props {
  steps: Step[];
  onComplete?: () => void;
}

const ARROW_HEIGHT = 18;
const ARROW_WIDTH = 50;
const GAP = 16;

export const Onboarding: React.FC<Props> = ({ steps, onComplete }) => {
  const media = useMedia();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const totalSteps = steps.length;
  const nextButtonText = steps.length - 1 === currentStepIndex ? "Thats it!" : "Next";

  const stepRef = useRef<HTMLDivElement>(null);
  const stepArrowRef = useRef<HTMLImageElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  const calculatePosition = () => {
    if (steps.length === 0 || !stepRef.current) return;

    const currentStep = steps[currentStepIndex];
    const key = media.mobile ? currentStep.mobileKey : currentStep.desktopKey;
    targetRef.current = document.querySelector(`[data-onboarding="${key}"]`);

    currentStep.beforeAction?.(media);

    if (targetRef.current && stepRef.current && stepArrowRef.current) {
      const { top, left, width, height } = targetRef.current.getBoundingClientRect();
      const { width: stepWidth, height: stepHeight } = stepRef.current.getBoundingClientRect();

      const stepPossibleLeft = left + width - stepWidth;
      const maxLeft = window.innerWidth - GAP - stepWidth;
      const stepLeft = Math.max(GAP, Math.min(stepPossibleLeft, maxLeft));

      const stepPossibleTop = top + height + ARROW_HEIGHT + GAP;
      const stepPossibleBottom = top - stepHeight - GAP - ARROW_HEIGHT;
      const maxTop = window.innerHeight - GAP - stepHeight;
      let stepTop = Math.max(GAP, Math.min(stepPossibleTop, maxTop));

      if (stepPossibleTop <= maxTop) {
        stepTop = stepPossibleTop;
      } else if (stepPossibleBottom >= GAP) {
        stepTop = stepPossibleBottom;
      } else {
        stepTop = Math.max(GAP, Math.min(stepPossibleTop, maxTop));
      }

      stepRef.current.style.top = `${stepTop}px`;
      stepRef.current.style.left = `${stepLeft}px`;

      const isTargetBelow = stepTop < top;

      const arrowTop = isTargetBelow ? stepHeight : -ARROW_HEIGHT;
      const arrowRotation = isTargetBelow ? "rotate(180deg)" : "none";
      const arrowLeft = left + width / 2 - stepLeft - ARROW_WIDTH / 2;

      stepArrowRef.current.style.top = `${arrowTop}px`;
      stepArrowRef.current.style.transform = arrowRotation;
      stepArrowRef.current.style.left = `${arrowLeft}px`;
    }
  };

  useLayoutEffect(() => {
    calculatePosition();

    const handleResize = () => calculatePosition();
    const handleScroll = () => calculatePosition();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [steps, currentStepIndex]);

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      return;
    }

    onComplete?.();
  };

  return (
    <OverlayContainer>
      <StepContainer ref={stepRef}>
        <ArrowIconStyled ref={stepArrowRef} src={arrowIcon} />
        <StepText>
          {currentStepIndex + 1} / {totalSteps}
        </StepText>
        <TitleText>{steps[currentStepIndex].desc}</TitleText>
        <ButtonStyled onClick={handleNextStep}>{nextButtonText}</ButtonStyled>
      </StepContainer>
    </OverlayContainer>
  );
};

const OverlayContainer = styled(SmartFlex)`
  position: fixed;

  width: 100%;
  height: 100%;

  background-color: ${({ theme }) => theme.colors.overlayBackground};

  z-index: 1000;
`;

const StepText = styled(Text)`
  font-family: Space Grotesk;
  font-size: 14px;
  font-weight: 500;
  line-height: 14px;
`;

const TitleText = styled(Text)`
  font-family: Space Grotesk;
  font-size: 18px;
  font-weight: 500;
  line-height: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const StepContainer = styled(SmartFlex)`
  position: absolute;
  border-radius: 12px;

  align-items: center;
  gap: 20px;

  width: max-content;

  padding: 22px 24px;
  box-shadow:
    0px 32px 48px -8px #00000059,
    0px 0px 14px -4px #00000033;

  background-color: ${({ theme }) => theme.colors.bgSecondary};

  transition:
    top 250ms ease,
    left 250ms ease;

  ${media.mobile} {
    padding: 12px 8px;
  }
`;

const ArrowIconStyled = styled.img`
  position: absolute;
  top: -18px;
  right: 0;

  transition: left 250ms ease;
`;

const ButtonStyled = styled(Button)`
  width: fit-content;
  padding: 12px 26px !important;
`;
