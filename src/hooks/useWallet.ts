import { useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useConnectUI,
  useFuel,
  useIsConnected,
  useWallet as useFuelWallet,
} from "@fuels/react";

interface ICurrentConnector {
  logo: string;
  title: string;
}

const DEFAULT_CONNECTOR: ICurrentConnector = {
  logo: "",
  title: "",
};

export const useWallet = () => {
  const { fuel } = useFuel();
  const { connect, isConnecting, isLoading: isLoadingConnectors } = useConnectUI();
  const { isConnected, refetch: refetchConnected } = useIsConnected();
  const { account, isLoading: isLoadingAccount, isFetching: isFetchingAccount } = useAccount();

  const address = account ?? "";

  const { wallet, refetch: refetchWallet } = useFuelWallet(address);

  const { balance, isLoading: isLoadingBalance, isFetching: isFetchingBalance } = useBalance({ address });

  const [currentConnector, setCurrentConnector] = useState<ICurrentConnector>(DEFAULT_CONNECTOR);

  useEffect(() => {
    refetchConnected();
  }, [refetchConnected]);

  useEffect(() => {
    if (!isConnected) {
      setCurrentConnector(DEFAULT_CONNECTOR);
      return;
    }

    const currentConnector = fuel.currentConnector();

    const title = currentConnector?.name ?? DEFAULT_CONNECTOR.title;

    const logo =
      currentConnector && typeof currentConnector.metadata?.image === "object"
        ? currentConnector.metadata.image.dark ?? ""
        : (currentConnector?.metadata?.image as string) ?? "";

    setCurrentConnector({ logo, title });
  }, [fuel.currentConnector, isConnected]);

  const isLoading = [isLoadingAccount, isLoadingBalance].some(Boolean);

  const isFetching = [isFetchingAccount, isFetchingBalance].some(Boolean);

  return {
    address,
    account,
    balance,
    currentConnector,
    isConnected,
    isConnecting,
    isLoading,
    isFetching,
    isLoadingConnectors,
    wallet,
    connect,
    refetchConnected,
    refetchWallet,
  };
};
