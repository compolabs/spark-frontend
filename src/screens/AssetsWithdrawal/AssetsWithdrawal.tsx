import React, { useState } from "react";
import styled from "@emotion/styled";

import { SmartFlex } from "@components/SmartFlex";

import MainAssets from "@screens/Assets/MainAssets/MainAssets";
import WithdrawAssets from "@screens/Assets/WithdrawAssets/WithdrawAssets";

import { getDeviceInfo } from "@utils/getDeviceInfo";

import { ActiveOrdersList } from "./ActiveOrdersList";

export const AssetsWithdrawal = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { isMobile } = getDeviceInfo();

  const setStep = (step: number) => {
    setCurrentStep(step);
  };
  const steps = [<MainAssets key={0} setStep={setStep} />, <WithdrawAssets key={0} setStep={setStep} />];

  return (
    <SmartFlex alignItems="center" width="100%" column>
      <AssetsContainer isMobile={isMobile}>{steps[currentStep]}</AssetsContainer>
      <ActiveOrdersList />
    </SmartFlex>
  );
};

const AssetsContainer = styled.div<{ isMobile: boolean }>`
  width: ${(props) => (props.isMobile ? "100%" : "45%")};
`;
