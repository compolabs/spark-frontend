import React from "react";
import { observer } from "mobx-react-lite";

import Button from "@components/Button";
import { useStores } from "@stores";

interface IProps {
  assetId: string;
  disabled?: boolean;
}

const MintButtons: React.FC<IProps> = observer(({ assetId, disabled }) => {
  const { faucetStore, mixPanelStore } = useStores();

  if (!faucetStore.initialized) {
    return (
      <Button disabled green>
        Loading...
      </Button>
    );
  }

  return (
    <Button
      disabled={disabled || faucetStore.disabled(assetId)}
      style={{ width: 120 }}
      onClick={() => {
        mixPanelStore.trackEvent("mintTokenInFaucet", { assetId });
        faucetStore.mintByAssetId(assetId);
      }}
    >
      {faucetStore.loading && faucetStore.actionTokenAssetId === assetId ? "Loading..." : "Mint"}
    </Button>
  );
});

export default MintButtons;
