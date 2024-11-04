import React, {ReactNode} from "react";
import { useFlag } from '@unleash/proxy-client-react';
import UnderConstruction from "@screens/Errors/UnderConstruction";

interface UnderConstructionProviderProps {
    children: ReactNode;
}

export const UnderConstructionProvider: React.FC<UnderConstructionProviderProps> = ({children}) => {
    const isUnderConstruction = useFlag('under_construction');
    if (isUnderConstruction) {
        return <UnderConstruction />;
    }
    return children
}