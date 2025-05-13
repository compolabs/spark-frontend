import { Nullable } from "tsdef";

import { FuelNetwork } from "./fuel/FuelNetwork";

export class Blockchain {
  private static instance: Nullable<Blockchain> = null;

  sdk: FuelNetwork;

  private constructor() {
    this.sdk = FuelNetwork.getInstance();
  }

  public static getInstance(): Blockchain {
    if (!Blockchain.instance) {
      Blockchain.instance = new Blockchain();
    }
    return Blockchain.instance;
  }
}
