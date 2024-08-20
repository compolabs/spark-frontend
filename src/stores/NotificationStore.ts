import { toast, ToastContent, ToastOptions } from "react-toastify";
import { makeAutoObservable } from "mobx";

import RootStore from "@stores/RootStore";

class NotificationStore {
  private readonly rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  toast = <TData = unknown>(content: ToastContent<TData>, options?: ToastOptions) => {
    const defaultOptions: ToastOptions = {
      ...options,
      autoClose: false,
    };

    toast(content, options);
  };
}

export default NotificationStore;
