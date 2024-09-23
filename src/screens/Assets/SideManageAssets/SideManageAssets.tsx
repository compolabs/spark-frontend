import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { observer } from "mobx-react";

import ModalSheet from "@components/ModalSheet";
import SideBar from "@components/SideBar";

import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";

import MainAssets from "@screens/Assets/MainAssets/MainAssets";
import WithdrawAssets from "@screens/Assets/WithdrawAssets/WithdrawAssets";

interface ResolverDevice {
  children: React.ReactNode;
  isVisible: boolean;
  handleClose: () => void;
}

const ResolverDevice = ({ children, handleClose, isVisible }: ResolverDevice) => {
  const media = useMedia();

  return (
    <>
      {media.mobile ? (
        <ModalSheet isVisible={isVisible} onClose={handleClose}>
          {children}
        </ModalSheet>
      ) : (
        <SideBar isVisible={isVisible} onClose={handleClose}>
          {children}
        </SideBar>
      )}
    </>
  );
};

const SideManageAssets = observer(() => {
  const { quickAssetsStore } = useStores();
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const [isBack, setIsBack] = useState(true);
  const setStep = (step: number) => {
    setIsBack(step > quickAssetsStore.currentStep);
    setIsFirstOpen(false);
    setTimeout(() => {
      quickAssetsStore.setCurrentStep(step);
    }, 100);
  };
  const MainAssetsComponent = () => <MainAssets setStep={setStep} />;
  const WithdrawAssetsComponent = () => <WithdrawAssets setStep={setStep} />;

  const steps = [MainAssetsComponent, WithdrawAssetsComponent];
  const CurrentComponent = steps[quickAssetsStore.currentStep];

  const handleClose = () => {
    setIsFirstOpen(true);
    quickAssetsStore.setQuickAssets(false);
  };
  return (
    <ResolverDevice handleClose={handleClose} isVisible={quickAssetsStore.openQuickAssets}>
      <AnimatePresence>
        <motion.div
          key={quickAssetsStore.currentStep}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: isBack ? -300 : 300, opacity: 0 }}
          initial={isFirstOpen ? { x: 0, opacity: 1 } : { x: isBack ? 300 : -300, opacity: 0 }}
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
