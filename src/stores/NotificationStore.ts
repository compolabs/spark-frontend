import { toast, ToastOptions } from "react-toastify";
import { makeAutoObservable } from "mobx";

import { createToast, ToastProps } from "@src/components/Toast";
import RootStore from "@stores/RootStore";

type NotificationParams = ToastProps & {
  options?: ToastOptions;
};

class NotificationStore {
  private readonly rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  private getDefaultToastOptions = (options?: ToastOptions): ToastOptions => ({
    autoClose: false,
    ...options,
  });

  private notify = (params: NotificationParams, type: "success" | "error" | "info") => {
    const options = this.getDefaultToastOptions({
      ...params.options,
      type,
    });
    toast(createToast(params), options);
  };

  success = (params: NotificationParams) => {
    this.notify(params, "success");
  };

  error = (params: NotificationParams) => {
    this.notify(params, "error");
  };

  info = (params: NotificationParams) => {
    this.notify(params, "info");
  };
}

export default NotificationStore;
