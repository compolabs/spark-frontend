import React from "react";
import { observer } from "mobx-react-lite";

import { useStores } from "@src/stores";
import { MODAL_TYPE } from "@src/stores/ModalStore";

import Button, { ButtonProps } from "./Button";

interface Props extends ButtonProps {
  connectText?: string;
  children: React.ReactNode;
}

export const ConnectWalletButton: React.FC<Props> = observer(
  ({ connectText = "Connect wallet", children, ...props }) => {
    const { accountStore, modalStore } = useStores();

    if (!accountStore.isConnected) {
      return (
        <Button green {...props} onClick={() => modalStore.open(MODAL_TYPE.CONNECT_MODAL)}>
          {connectText}
        </Button>
      );
    }

    return <>{children}</>;
  },
);
