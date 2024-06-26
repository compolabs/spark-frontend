import { createToast } from "@src/components/Toast";
import { NotificationStore } from "@src/stores";

export const handleWalletErrors = (notificationStore: NotificationStore, error: any, defaultMessage?: string) => {
  const message = error?.message.toLowerCase();

  if (message.includes("user rejected action") || message.includes("user rejected the transaction")) return;
  if (message.includes("assets already exist in wallet settings")) return;

  if (message.includes("not enough coins to fit the target")) {
    notificationStore.toast(createToast({ text: "Not enough funds to pay gas" }), { type: "error" });
    return;
  }
  if (message.includes("insufficient funds for intrinsic transaction cost")) {
    notificationStore.toast(createToast({ text: "Not enough funds to pay gas" }), { type: "error" });
    return;
  }
  notificationStore.toast(createToast({ text: defaultMessage ?? error.toString() }), { type: "error" });
};
