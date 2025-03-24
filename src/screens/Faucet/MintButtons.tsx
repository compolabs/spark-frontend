import React from "react";
import { observer } from "mobx-react-lite";

import Button from "@components/Button";

import { useStores } from "@stores";

interface MintButtonsProps {
  assetId: string;
  disabled?: boolean;
}

const MintButtons: React.FC<MintButtonsProps> = observer(({ assetId, disabled }) => {
  const { faucetStore } = useStores();

  if (!faucetStore.initialized) {
    return (
      <Button disabled green>
        Loading...
      </Button>
    );
  }

  return (
    <Button
      disabled={disabled || faucetStore.isDisabled(assetId)}
      style={{ width: 120 }}
      onClick={() => {
        faucetStore.mintByAssetId(assetId);
      }}
    >
      {faucetStore.loading && faucetStore.actionTokenAssetId === assetId ? "Loading..." : "Mint"}
    </Button>
  );
});

export default MintButtons;
