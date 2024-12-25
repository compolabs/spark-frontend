import React, { ReactNode } from "react";
import styled from "@emotion/styled";

// import { useFlag, useFlagsStatus } from "@unleash/proxy-client-react";
import Loader from "@components/Loader";

import UnderConstruction from "@screens/Errors/UnderConstruction";

interface UnderConstructionProviderProps {
  children: ReactNode;
}

export const UnderConstructionProvider: React.FC<UnderConstructionProviderProps> = ({ children }) => {
  // const isUnderConstruction = useFlag("under_construction");
  // const { flagsReady } = useFlagsStatus();

  const flagsReady = true;
  const isUnderConstruction = false;

  if (!flagsReady) {
    return <LoaderStyled size={32} hideText />;
  }
  if (isUnderConstruction) {
    return <UnderConstruction />;
  }
  return children;
};

const LoaderStyled = styled(Loader)`
  height: 100vh;
`;
