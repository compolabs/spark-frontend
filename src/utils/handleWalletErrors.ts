import { getHumanReadableError } from "@compolabs/spark-orderbook-ts-sdk";

import { NotificationStore } from "@stores";

export const handleWalletErrors = (
  notificationStore: NotificationStore,
  error: any,
  defaultMessage?: React.ReactNode,
) => {
  console.error(`Error: ${error}`);

  const message = error?.message.toLowerCase();

  if (message.includes("user rejected action") || message.includes("user rejected the transaction")) return;
  if (message.includes("assets already exist in wallet settings")) return;

  if (message.includes("not enough coins to fit the target")) {
    notificationStore.error({ text: "Not enough funds to pay gas" });
    return;
  }
  if (message.includes("insufficient funds for intrinsic transaction cost")) {
    notificationStore.error({ text: "Not enough funds to pay gas" });
    return;
  }

  let extendedErrorText;

  try {
    // TODO: Fix it
    console.error("Detail info: ", error);
    extendedErrorText = getHumanReadableError(error.metadata.logs);
  } catch (error) {
    console.error("Failed to parse error: ", error);
  }

  notificationStore.error({
    text: defaultMessage ?? error.toString(),
    error: extendedErrorText,
  });
};
