import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { observer } from "mobx-react";

import ModalSheet from "@components/ModalSheet.tsx";
import SideBar from "@components/SideBar.tsx";
import DepositAssets from "@screens/assets/DepositAssets/DepositAssets.tsx";
import MainAssets from "@screens/assets/MainAssets/MainAssets.tsx";
import WithdrawAssets from "@screens/assets/WithdrawAssets/WithdrawAssets.tsx";
import useIsMobile from "@src/hooks/useIsMobile.tsx";
import { useStores } from "@stores";

interface ResolverDevice {
  children: React.ReactNode;
  isShow: boolean;
  handleClose: () => void;
}

const ResolverDevice = ({ children, handleClose, isShow }: ResolverDevice) => {
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? (
        <ModalSheet isShow={isShow} onClose={handleClose}>
          {children}
        </ModalSheet>
      ) : (
        <SideBar isShow={isShow} onClose={handleClose}>
          {children}
        </SideBar>
      )}
    </>
  );
};
const SideManageAssets = observer(() => {
  const { quickAssetsStore } = useStores();
  const [currentStep, setCurrentStep] = useState(0);
  const [isFirstOpen, setIsFirstOpen] = useState(true);

  const setStep = (step: number) => {
    setIsFirstOpen(false);
    setCurrentStep(step);
  };
  const MainAssetsComponent = () => <MainAssets setStep={setStep} />;
  const DepositAssetsComponent = () => <DepositAssets setStep={setStep} />;
  const WithdrawAssetsComponent = () => <WithdrawAssets setStep={setStep} />;

  const steps = [MainAssetsComponent, DepositAssetsComponent, WithdrawAssetsComponent];
  const CurrentComponent = steps[currentStep];

  const handleClose = () => {
    setIsFirstOpen(true);
    quickAssetsStore.setQuickAssets(false);
  };
  return (
    <ResolverDevice handleClose={handleClose} isShow={quickAssetsStore.openQuickAssets}>
      <AnimatePresence>
        <motion.div
          key={currentStep}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          initial={isFirstOpen ? { x: 0, opacity: 1 } : { x: 300, opacity: 0 }}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          transition={{ duration: 0.5 }}
        >
          <CurrentComponent />
        </motion.div>
      </AnimatePresence>
    </ResolverDevice>
  );
});

export default SideManageAssets;
