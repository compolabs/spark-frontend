import React, { ReactNode } from "react";
import { FlagProvider, IConfig } from "@unleash/proxy-client-react";

const config: IConfig = {
  url: "https://unleash.spark-defi.com/unleash/api/frontend/",
  clientKey: import.meta.env.VITE_FEATURE_TOGGLE_CLIENT_KEY ?? "",
  refreshInterval: 15,
  appName: "spark-frontend",
};

interface FeatureProviderProps {
  children: ReactNode;
}

const isFeaturesDisabled = true;

export const FeatureToggleProvider: React.FC<FeatureProviderProps> = ({ children }) => {
  if (isFeaturesDisabled) {
    return children;
  }

  return (
    <FlagProvider config={config} startClient>
      {children}
    </FlagProvider>
  );
};
