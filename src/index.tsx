import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { FuelProvider } from "@fuels/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ThemeWrapper from "@src/themes/ThemeProvider";
import { loadState } from "@src/utils/localStorage";
import { RootStore, storesContext } from "@stores";

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

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  // <React.StrictMode>
  <storesContext.Provider value={STORE}>
    <ThemeWrapper>
      <QueryClientProvider client={queryClient}>
        <FuelProvider fuelConfig={FUEL_CONFIG} theme="dark">
          <Router>
            <App />
          </Router>
        </FuelProvider>
      </QueryClientProvider>
      <ToastContainer
        autoClose={5000}
        closeOnClick={false}
        icon={<div />}
        newestOnTop={true}
        position="bottom-right"
        rtl={false}
        theme="dark"
        draggable
        pauseOnFocusLoss
        pauseOnHover
      />
      <GlobalStyles />
    </ThemeWrapper>
  </storesContext.Provider>,
  // </React.StrictMode>,
);
function createConfig(arg0: { chains: any[]; transports: { [x: number]: any }; connectors: any[] }) {
  throw new Error("Function not implemented.");
}

function http() {
  throw new Error("Function not implemented.");
}

function injected(arg0: { shimDisconnect: boolean }) {
  throw new Error("Function not implemented.");
}

function walletConnect(arg0: {
  projectId: string;
  metadata: { name: string; description: string; url: string; icons: string[] };
  showQrModal: boolean;
}) {
  throw new Error("Function not implemented.");
}

function coinbaseWallet(arg0: { appName: string; appLogoUrl: string; darkMode: boolean; reloadOnDisconnect: boolean }) {
  throw new Error("Function not implemented.");
}
