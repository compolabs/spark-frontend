import { toast, ToastOptions } from "react-toastify";
import { makeAutoObservable } from "mobx";

import { createToast, ToastProps } from "@src/components/Toast";
import RootStore from "@stores/RootStore";

interface NotificationParams {
  content: ToastProps;
  options?: ToastOptions;
}

class NotificationStore {
  private readonly rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  notify = (params: NotificationParams) => {
    const defaultOptions: ToastOptions = {
      ...params.options,
      autoClose: false,
    };

    const customToast = createToast(params.content);

    toast(customToast, defaultOptions);
  };
}

export default NotificationStore;
