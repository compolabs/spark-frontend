import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { useStores } from "@src/stores";

const PK_KEY = "pk";

export const usePrivateKeyAsAuth = () => {
  const { accountStore } = useStores();
  const [searchParams] = useSearchParams();

  console.log(searchParams);

  useEffect(() => {
    const privateKey = searchParams.get(PK_KEY);

    if (!privateKey?.length) return;

    console.log(privateKey);

    (async () => accountStore.connectWalletByPrivateKey(privateKey))();
  }, [searchParams]);
};
