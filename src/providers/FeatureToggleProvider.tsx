import React, {ReactNode} from "react";
import { FlagProvider } from '@unleash/proxy-client-react';

const config = {
    url: 'https://unleash.spark-defi.com/unleash/api/frontend/',
    clientKey: import.meta.env.VITE_FEATURE_TOGGLE_CLIENT_KEY ?? "",
    refreshInterval: 15,
    appName: 'spark-frontend',
};

interface FeatureProviderProps {
    children: ReactNode;
}


export const FeatureToggleProvider: React.FC<FeatureProviderProps> = ({children}) => {
    return <FlagProvider config={config}>{children}</FlagProvider>;
}