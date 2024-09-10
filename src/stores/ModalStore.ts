import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import RootStore from "./RootStore";

export enum MODAL_TYPE {
  DEPOSIT_WITHDRAW_MODAL,
  CONNECT_MODAL,
}

export class ModalStore {
  private readonly rootStore: RootStore;

  modal: Nullable<MODAL_TYPE> = null;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  isOpen = (modal: MODAL_TYPE) => {
    return this.modal === modal;
  };

  open = (modal: MODAL_TYPE) => {
    this.modal = modal;
  };

  close = () => {
    this.modal = null;
  };
}
