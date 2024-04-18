import React, { useMemo } from "react";
import { useTheme } from "@emotion/react";

import { AVAILABLE_NETWORKS } from "@src/blockchain/types";
import { useStores } from "@src/stores";

import Text, { TEXT_TYPES } from "../Text";

export const ActiveNetwork = ({ hasTitle }: { hasTitle?: boolean }) => {
  const theme = useTheme();
  const { blockchainStore } = useStores();

  const activeNetwork = useMemo(() => {
    return AVAILABLE_NETWORKS.find(({ type }) => type === blockchainStore.currentInstance?.NETWORK_TYPE);
  }, [blockchainStore.currentInstance?.NETWORK_TYPE]);

  return (
    <>
      <img alt={activeNetwork?.title} src={activeNetwork?.icon} />
      {hasTitle && (
        <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON_SECONDARY}>
          {activeNetwork?.title}
        </Text>
      )}
    </>
  );
};
