import React from "react";
import { observer } from "mobx-react-lite";

import { useStores } from "@stores";
import { MODAL_TYPE } from "@stores/ModalStore";

import Button, { ButtonProps } from "./Button";

interface Props extends ButtonProps {
  connectText?: string;
  children: React.ReactNode;
  targetKey: string;
}

export const ConnectWalletButton: React.FC<Props> = observer(
  ({ connectText = "Connect wallet", children, ...props }) => {
    const { accountStore, modalStore, mixPanelStore } = useStores();

    const handleConnectClick = () => {
      modalStore.open(MODAL_TYPE.CONNECT);
      mixPanelStore.connectButtonUsed = props.targetKey;
    };

    if (!accountStore.isConnected) {
      return (
        <Button green {...props} onClick={handleConnectClick}>
          {connectText}
        </Button>
      );
    }

    return <>{children}</>;
  },
);
