import { useEffect } from "react";
import { useAccount, useConnectUI, useIsConnected, useWallet as useFuelWallet } from "@fuels/react";
import { useDisconnect } from "@fuels/react";

export const useWallet = () => {
  const { connect, isConnecting } = useConnectUI();
  const { isConnected, refetch: refetchConnected } = useIsConnected();
  const { account: address } = useAccount();
  const { disconnect } = useDisconnect();

  const { wallet } = useFuelWallet(address);

  useEffect(() => {
    refetchConnected();
  }, [refetchConnected]);

  return {
    isConnected,
    isConnecting,
    wallet,
    connect,
    disconnect,
  };
};
