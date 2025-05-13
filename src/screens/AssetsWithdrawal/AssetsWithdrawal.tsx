import React, { useState } from "react";
import styled from "@emotion/styled";

import MainAssets from "@screens/Assets/MainAssets/MainAssets";
import WithdrawAssets from "@screens/Assets/WithdrawAssets/WithdrawAssets";

import { getDeviceInfo } from "@utils/getDeviceInfo";

export const AssetsWithdrawal = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { isMobile } = getDeviceInfo();

  const setStep = (step: number) => {
    setCurrentStep(step);
  };
  const steps = [<MainAssets key={0} setStep={setStep} />, <WithdrawAssets key={0} setStep={setStep} />];

  return <AssetsContainer isMobile={isMobile}>{steps[currentStep]}</AssetsContainer>;
};

const AssetsContainer = styled.div<{ isMobile: boolean }>`
  width: ${(props) => (props.isMobile ? "100%" : "45%")};
  height: 100vh;
`;
