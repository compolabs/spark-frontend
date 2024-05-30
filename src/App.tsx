import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import Text from "@components/Text";

import { usePrivateKeyAsAuth } from "./hooks/usePrivateKeyAsAuth";
import { useWeb3Modal } from "./hooks/useWeb3Modal";

const Root = styled(Column)`
  width: 100%;
  align-items: center;
  background: ${({ theme }) => theme.colors.bgPrimary};
  height: 100vh;
`;

const App: React.FC = observer(() => {
  useWeb3Modal();
  usePrivateKeyAsAuth();

  return (
    <Root>
      {/*<Header />*/}
      <Column alignItems="center" justifyContent="center" mainAxisSize="stretch">
        <Text>Spark is under construction</Text>
      </Column>
      {/*<Routes>*/}
      {/*  <Route element={<TradeScreen />} path={ROUTES.TRADE} />*/}
      {/*  <Route element={<TradeScreen />} path={ROUTES.ROOT} />*/}
      {/*  <Route element={<Faucet />} path={ROUTES.FAUCET} />*/}
      {/*</Routes>*/}
    </Root>
  );
});

export default App;
