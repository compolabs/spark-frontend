import { toast, ToastOptions, TypeOptions } from "react-toastify";
import { makeAutoObservable } from "mobx";

import { createToast, NotificationProps } from "@src/components/Toast";
import { getDeviceInfo } from "@src/utils/getDeviceInfo";
import RootStore from "@stores/RootStore";

type NotificationParams = Omit<NotificationProps, "type"> & {
  options?: ToastOptions;
};

class NotificationStore {
  private readonly rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  private getDefaultToastOptions = (options?: ToastOptions): ToastOptions => {
    const { isMobile } = getDeviceInfo();
    const position = isMobile ? "top-center" : "bottom-left";

    return {
      autoClose: 5000,
      closeOnClick: false,
      icon: false,
      position,
      theme: "dark",
      draggable: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      hideProgressBar: true,
      closeButton: false,

      ...options,
    };
  };

  private notify = (params: NotificationParams, type: TypeOptions) => {
    const options = this.getDefaultToastOptions({
      ...params.options,
      type,
    });
    toast((toastProps) => createToast({ ...params, ...toastProps }), options);
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
