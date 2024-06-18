import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
// import { WalletConnectConnector } from "@fuels/connectors/walletconnect";
import { FuelProvider } from "@fuels/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// import { coinbaseWallet, walletConnect } from "@wagmi/connectors";
// import { createConfig, http, injected } from "@wagmi/core";
// import { mainnet, sepolia } from "@wagmi/core/chains";
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

// const WC_PROJECT_ID = "cf4ad9eca02fdf75b8c6ef0b687ddd16";
// const METADATA = {
//   name: "Spark",
//   description: "Spark is the fastest onchain order book based on Fuel Network",
//   url: location.href,
//   icons: ["https://connectors.fuel.network/logo_white.png"],
// };
// const wagmiConfig = createConfig({
//   chains: [mainnet, sepolia],
//   transports: {
//     [mainnet.id]: http(),
//     [sepolia.id]: http(),
//   },
//   connectors: [
//     injected({ shimDisconnect: false }),
//     walletConnect({
//       projectId: WC_PROJECT_ID,
//       metadata: METADATA,
//       showQrModal: false,
//     }),
//     coinbaseWallet({
//       appName: METADATA.name,
//       appLogoUrl: METADATA.icons[0],
//       darkMode: true,
//       reloadOnDisconnect: true,
//     }),
//   ],
// });

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
