import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import Header from "@components/Header";
import { PWAModal } from "@components/PWAModal";
import { SplashScreen } from "@components/Splashscreen";

import { useClearUrlParam } from "@hooks/useClearUrlParam";
import { usePrivateKeyAsAuth } from "@hooks/usePrivateKeyAsAuth";
import { useStores } from "@stores";
import { MODAL_TYPE } from "@stores/ModalStore";

import SideManageAssets from "@screens/Assets/SideManageAssets/SideManageAssets";
import ConnectWalletDialog from "@screens/ConnectWallet";
import UnderConstruction from "@screens/Errors/UnderConstruction";
import Faucet from "@screens/Faucet";
import SpotScreen from "@screens/SpotScreen";
import { SwapScreen } from "@screens/SwapScreen";

import { DEFAULT_MARKET, ROUTES } from "@constants";

const isUnderConstruction = false;

const DEFAULT_SPOT_ROUTE = `/spot/${DEFAULT_MARKET}`;

const App: React.FC = observer(() => {
  const { modalStore } = useStores();

  // This hooks is used to clear unnecessary URL parameters,
  // specifically "tx_id", after returning from the faucet
  useClearUrlParam("tx_id");

  usePrivateKeyAsAuth();

  if (isUnderConstruction) {
    return <UnderConstruction />;
  }

  return (
    <Root>
      <Header />
      <Routes>
        <Route element={<SpotScreen />} path={`${ROUTES.SPOT}/:marketId`} />
        <Route element={<SwapScreen />} path={ROUTES.SWAP} />
        <Route element={<Faucet />} path={ROUTES.FAUCET} />
        <Route element={<Navigate to={ROUTES.ROOT} />} path="*" />
        <Route element={<Navigate to={DEFAULT_SPOT_ROUTE} />} path={ROUTES.ROOT} />
      </Routes>
      <SideManageAssets />
      <PWAModal />
      <SplashScreen />
      <ConnectWalletDialog visible={modalStore.isOpen(MODAL_TYPE.CONNECT_MODAL)} onClose={() => modalStore.close()} />
    </Root>
  );
});

export default App;

const Root = styled(Column)`
  width: 100%;
  align-items: center;
  background: ${({ theme }) => theme.colors.bgPrimary};
  height: 100vh;
`;
