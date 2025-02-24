import React, { useLayoutEffect, useRef, useState } from "react";
import styled from "@emotion/styled";

import { media } from "@themes/breakpoints";

import CloseIcon from "@assets/icons/close.svg?react";
import arrowIcon from "@assets/icons/onboardingArrow.svg";

import { IMedia, useMedia } from "@hooks/useMedia";

import Button from "./Button";
import { SmartFlex } from "./SmartFlex";
import Text from "./Text";

export interface Step {
  desktopKey: string;
  mobileKey: string;
  desc: string;
  icon?: React.FC;
  beforeAction?: (media: IMedia) => void;
}

interface Props {
  steps: Step[];
  onComplete?: () => void;
}

const ARROW_HEIGHT = 18;
const ARROW_WIDTH = 50;
const GAP = 16;

// TODO: There seems to be a serious problem on mobile devices. We need to figure out why there’s such jittering when highlighting elements.

// const createOverlayCopy = (element: HTMLElement): HTMLElement => {
//   const copyContainer = document.createElement("div");
//   copyContainer.style.position = "absolute";
//   copyContainer.style.zIndex = "10000";
//   copyContainer.style.top = `${element.getBoundingClientRect().top}px`;
//   copyContainer.style.left = `${element.getBoundingClientRect().left}px`;
//   copyContainer.style.width = `${element.offsetWidth}px`;
//   copyContainer.style.height = `${element.offsetHeight}px`;

//   const clone = element.cloneNode(true) as HTMLElement;
//   copyContainer.appendChild(clone);

//   document.body.appendChild(copyContainer);

//   return copyContainer;
// };

// const removeOverlayCopy = (copyContainer: HTMLElement) => {
//   document.body.removeChild(copyContainer);
// };

export const Onboarding: React.FC<Props> = ({ steps, onComplete }) => {
  const media = useMedia();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const totalSteps = steps.length;
  const isLastStep = steps.length - 1 === currentStepIndex;
  const nextButtonText = isLastStep ? "Thats it!" : "Next";

  const stepRef = useRef<HTMLDivElement>(null);
  const stepArrowRef = useRef<HTMLImageElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  // const targetCopyRef = useRef<HTMLElement | null>(null);

  const calculatePosition = () => {
    if (steps.length === 0 || !stepRef.current) return;

    const currentStep = steps[currentStepIndex];
    const key = media.mobile ? currentStep.mobileKey : currentStep.desktopKey;

    currentStep.beforeAction?.(media);

    targetRef.current = document.querySelector(`[data-onboarding="${key}"]`);

    if (targetRef.current && stepRef.current && stepArrowRef.current) {
      const { top, left, width, height } = targetRef.current.getBoundingClientRect();
      const { width: stepWidth, height: stepHeight } = stepRef.current.getBoundingClientRect();

      // Create a copy of the target element and place it at the top of the DOM
      // targetCopyRef.current = createOverlayCopy(targetRef.current);

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
      const arrowLeft = Math.max(GAP, Math.min(left + width / 2 - stepLeft - ARROW_WIDTH / 2, stepWidth - ARROW_WIDTH));

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
    // if (targetCopyRef.current) {
    //   // Remove the copied element when no longer needed
    //   removeOverlayCopy(targetCopyRef.current);
    // }

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);

      return;
    }

    onComplete?.();
  };

  const currentStep = steps[currentStepIndex];
  const Icon = currentStep.icon;

  return (
    <OverlayContainer>
      <StepContainer ref={stepRef}>
        <ArrowIconStyled ref={stepArrowRef} src={arrowIcon} />
        {Icon && (
          <IconContainer>
            <Icon />
          </IconContainer>
        )}
        <TitleText type="BUTTON">{currentStep.desc}</TitleText>
        <ButtonStyled text onClick={handleNextStep}>
          {nextButtonText}
        </ButtonStyled>
        {!isLastStep && (
          <CloseIconContainer onClick={onComplete}>
            <CloseIcon />
          </CloseIconContainer>
        )}
      </StepContainer>
    </OverlayContainer>
  );
};

const OverlayContainer = styled(SmartFlex)`
  position: fixed;

  width: 100%;
  height: 100%;

  background-color: #00000080;

  z-index: 1000;
`;

const TitleText = styled(Text)`
  background: linear-gradient(to right, #fff, #ff9b57, #54bb94);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StepContainer = styled(SmartFlex)`
  position: absolute;
  border-radius: 12px;

  align-items: center;
  gap: 20px;

  width: max-content;

  padding: 14px 16px;
  box-shadow:
    0px 24px 32px 0px #00000026,
    0px 0px 6px 0px #00000033;

  background-color: #232323;

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
  height: fit-content !important;
  padding: 0 !important;
`;

const IconContainer = styled(SmartFlex)`
  align-items: center;
  justify-content: center;
  height: 24px;
  width: 24px;
`;

const CloseIconContainer = styled(SmartFlex)`
  align-items: center;
  justify-content: center;
  height: 16px;
  width: 16px;

  path {
    transition: fill 200ms ease;
  }

  cursor: pointer;
  &:hover {
    path {
      fill: ${({ theme }) => theme.colors.iconPrimary};
    }
  }
`;
