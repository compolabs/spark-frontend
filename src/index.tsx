import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { FuelProvider } from "@fuels/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CHAIN_IDS, Network } from "fuels";

import ThemeWrapper from "@themes/ThemeProvider";

import { RootStore, storesContext } from "@stores";

import { CONFIG } from "@utils/getConfig";
import { loadState } from "@utils/localStorage";

import "@themes/fonts";

import GlobalStyles from "./themes/GlobalStyles";
import App from "./App";
import { FUEL_CONFIG } from "./constants";

import "react-toastify/dist/ReactToastify.css";
import "rc-dialog/assets/index.css";
import "./index.css";
import "normalize.css";

const initState = loadState();

const STORE = RootStore.create(initState);

console.warn(`Version: ${process.env.__COMMIT_HASH__}`);

const queryClient = new QueryClient();

const networks: Array<Network> = [
  {
    chainId: CONFIG.APP.isMainnet ? CHAIN_IDS.fuel.mainnet : CHAIN_IDS.fuel.testnet,
    url: CONFIG.APP.networkUrl,
  },
];

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  // <React.StrictMode>
  <storesContext.Provider value={STORE}>
    <ThemeWrapper>
      <QueryClientProvider client={queryClient}>
        <FuelProvider fuelConfig={FUEL_CONFIG} networks={networks} theme="dark">
          <Router>
            <App />
          </Router>
        </FuelProvider>
      </QueryClientProvider>
      <ToastContainer />
      <GlobalStyles />
    </ThemeWrapper>
  </storesContext.Provider>,
  // </React.StrictMode>,
);
