import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { observer } from "mobx-react";

import ModalSheet from "@components/ModalSheet";
import SideBar from "@components/SideBar";
import DepositAssets from "@screens/assets/DepositAssets/DepositAssets";
import MainAssets from "@screens/assets/MainAssets/MainAssets";
import WithdrawAssets from "@screens/assets/WithdrawAssets/WithdrawAssets";
import useIsMobile from "@src/hooks/useIsMobile";
import { useStores } from "@stores";
import { useMedia } from "@src/hooks/useMedia";

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

  const setStep = (step: number) => {
    setIsFirstOpen(false);
    quickAssetsStore.setCurrentStep(step);
  };
  const MainAssetsComponent = () => <MainAssets setStep={setStep} />;
  const DepositAssetsComponent = () => <DepositAssets setStep={setStep} />;
  const WithdrawAssetsComponent = () => <WithdrawAssets setStep={setStep} />;

  const steps = [MainAssetsComponent, DepositAssetsComponent, WithdrawAssetsComponent];
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
