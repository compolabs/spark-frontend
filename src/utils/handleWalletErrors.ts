import { NotificationStore } from "@src/stores";

export const handleWalletErrors = (notificationStore: NotificationStore, error: any, defaultMessage?: string) => {
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
  notificationStore.error({ text: defaultMessage ?? error.toString() });
};
