import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import SideManageAssets from "@screens/Assets/SideManageAssets/SideManageAssets";

import Header from "./components/Header";
import { PWAModal } from "./components/PWAModal";
import { SplashScreen } from "./components/Splashscreen";
import { usePrivateKeyAsAuth } from "./hooks/usePrivateKeyAsAuth";
import UnderConstruction from "./screens/Errors/UnderConstruction";
import Faucet from "./screens/Faucet";
import { SwapScreen } from "./screens/SwapScreen";
import TradeScreen from "./screens/TradeScreen";
import { DEFAULT_MARKET, ROUTES } from "./constants";

const isUnderConstruction = false;

const DEFAULT_SPOT_ROUTE = `/spot/${DEFAULT_MARKET}`;

const App: React.FC = observer(() => {
  usePrivateKeyAsAuth();

  if (isUnderConstruction) {
    return <UnderConstruction />;
  }

  return (
    <Root>
      <Header />
      <Routes>
        <Route element={<TradeScreen />} path={ROUTES.SPOT} />
        <Route element={<SwapScreen />} path={ROUTES.SWAP} />
        <Route element={<Faucet />} path={ROUTES.FAUCET} />
        <Route element={<Navigate to={ROUTES.ROOT} />} path="*" />
        <Route element={<Navigate to={DEFAULT_SPOT_ROUTE} />} path={ROUTES.ROOT} />
      </Routes>
      <SideManageAssets />
      <PWAModal />
      <SplashScreen />
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
