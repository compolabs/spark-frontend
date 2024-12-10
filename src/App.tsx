import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import Header from "@components/Header";
import { PWAModal } from "@components/PWAModal";
import { SplashScreen } from "@components/Splashscreen";

import { useClearUrlParam } from "@hooks/useClearUrlParam";
import { useStores } from "@stores";
import { MODAL_TYPE } from "@stores/ModalStore";

import SideManageAssets from "@screens/Assets/SideManageAssets/SideManageAssets";
import ConnectWalletDialog from "@screens/ConnectWallet";
import Dashboard from "@screens/Dashboard";
import Faucet from "@screens/Faucet";
import PerpScreen from "@screens/PerpScreen/PerpScreen";
import SpotScreen from "@screens/SpotScreen";
import { SwapScreen } from "@screens/SwapScreen";

import { ROUTES } from "@constants";

import { FeatureToggleProvider, IntercomProvider, UnderConstructionProvider } from "@src/providers";
import { DiscordProvider } from "@src/providers/DiscordProvider";
const App: React.FC = observer(() => {
  const { modalStore, marketStore } = useStores();

  // This hooks is used to clear unnecessary URL parameters,
  // specifically "tx_id", after returning from the faucet
  useClearUrlParam("tx_id");

  // usePrivateKeyAsAuth();

  return (
    <IntercomProvider>
      <DiscordProvider>
        <FeatureToggleProvider>
          <UnderConstructionProvider>
            <Root>
              <Header />
              <Routes>
                <Route element={<SpotScreen />} path={`${ROUTES.SPOT}/:marketId`} />
                <Route element={<PerpScreen />} path={`${ROUTES.PERP}/:marketId`} />
                <Route element={<SwapScreen />} path={ROUTES.SWAP} />
                <Route element={<Faucet />} path={ROUTES.FAUCET} />
                <Route element={<Navigate to={ROUTES.ROOT} />} path="*" />
                <Route element={<Navigate to={`${ROUTES.SPOT}/${marketStore.marketSymbol}`} />} path={ROUTES.ROOT} />
                <Route element={<Dashboard />} path={ROUTES.DASHBOARD} />
              </Routes>
              <SideManageAssets />
              <PWAModal />
              <SplashScreen />
              <ConnectWalletDialog visible={modalStore.isOpen(MODAL_TYPE.CONNECT_MODAL)} onClose={modalStore.close} />
            </Root>
          </UnderConstructionProvider>
        </FeatureToggleProvider>
      </DiscordProvider>
    </IntercomProvider>
  );
});

export default App;

const Root = styled(Column)`
  width: 100%;
  align-items: center;
  background: ${({ theme }) => theme.colors.bgPrimary};
  height: 100vh;
`;
