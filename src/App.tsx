import React from "react";
import { Route, Routes } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import ConnectWalletDialog from "@components/ConnectWalletDialog";
import { Column } from "@components/Flex";
import Header from "@components/Header";
import WalletConnectors from "@components/WalletConnectors";

import { useClearUrlParam } from "@hooks/useClearUrlParam";
import { useStores } from "@stores";
import { MODAL_TYPE } from "@stores/ModalStore";

import SideManageAssets from "@screens/Assets/SideManageAssets/SideManageAssets";
import { AssetsWithdrawal } from "@screens/AssetsWithdrawal/AssetsWithdrawal";

import { ROUTES } from "@constants";

const App: React.FC = observer(() => {
  const { modalStore } = useStores();

  // This hooks is used to clear unnecessary URL parameters,
  // specifically "tx_id", after returning from the faucet
  useClearUrlParam("tx_id");

  // usePrivateKeyAsAuth();

  return (
    // <IntercomProvider>
    //   <DiscordProvider>
    //     <FeatureToggleProvider>
    //       <UnderConstructionProvider>
    <Root>
      <Header />
      {/* <HeaderPoints /> */}
      <Routes>
        <Route element={<AssetsWithdrawal />} path={`${ROUTES.ROOT}`} />
      </Routes>
      {/*<Routes>*/}
      {/*  <Route element={<SpotScreen />} path={`${ROUTES.SPOT}/:marketId`} />*/}
      {/*  <Route element={<SwapScreen />} path={ROUTES.SWAP} />*/}
      {/*  <Route element={<Faucet />} path={ROUTES.FAUCET} />*/}
      {/*  <Route element={<Navigate to={ROUTES.ROOT} />} path="*" />*/}
      {/*  <Route element={<Navigate to={`${ROUTES.SPOT}/${tradeStore.marketSymbol}`} />} path={ROUTES.ROOT} />*/}
      {/*  <Route element={<Dashboard />} path={ROUTES.DASHBOARD} />*/}
      {/*  <Route element={<Leaderboard />} path={ROUTES.LEADERBOARD} />*/}
      {/*  <Route element={<Competitions />} path={ROUTES.COMPETITIONS} />*/}
      {/*  <Route element={<Stats />} path={ROUTES.STATS} />*/}
      {/*</Routes>*/}
      <SideManageAssets />
      <WalletConnectors visible={modalStore.isOpen(MODAL_TYPE.SELECT_WALLET)} onClose={modalStore.close} />
      <ConnectWalletDialog visible={modalStore.isOpen(MODAL_TYPE.CONNECT)} onClose={modalStore.close} />
      {/*<MobileAppStoreSheet isOpen={isAppStoreSheetVisible} onClose={() => setIsAppStoreSheetVisible(false)} />*/}
      {/*<Onboarding />*/}
    </Root>
    //    </UnderConstructionProvider>
    //   </FeatureToggleProvider>
    //   </DiscordProvider>
    // </IntercomProvider>
  );
});

export default App;

const Root = styled(Column)`
  width: 100%;
  align-items: center;
  background: ${({ theme }) => theme.colors.bgPrimary};
  height: 100vh;
`;
