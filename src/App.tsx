import React from "react";
import { Route, Routes } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";

import Header from "./components/Header";
import { usePrivateKeyAsAuth } from "./hooks/usePrivateKeyAsAuth";
import UnderConstruction from "./screens/Errors/UnderConstruction";
import Faucet from "./screens/Faucet";
import TradeScreen from "./screens/TradeScreen";
import { ROUTES } from "./constants";
import { ApolloProvider } from "@apollo/client";
import client from "src/apolloClient";
const isUnderConstruction = false;

const App: React.FC = observer(() => {
  usePrivateKeyAsAuth();

  if (isUnderConstruction) {
    return <UnderConstruction />;
  }

  return (
    <ApolloProvider client={client}>
      <Root>
        <Header />
        {/* <Column alignItems="center" justifyContent="center" mainAxisSize="stretch">
        <Text>Spark is under construction</Text>
      </Column> */}
        <Routes>
          <Route element={<TradeScreen />} path={ROUTES.TRADE} />
          <Route element={<TradeScreen />} path={ROUTES.ROOT} />
          <Route element={<Faucet />} path={ROUTES.FAUCET} />
        </Routes>
      </Root>
    </ApolloProvider>
  );
});

export default App;

const Root = styled(Column)`
  width: 100%;
  align-items: center;
  background: ${({ theme }) => theme.colors.bgPrimary};
  height: 100vh;
`;
