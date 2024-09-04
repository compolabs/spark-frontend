import BN from "./BN";

class Math {
  static adjustDecimals(value: BN, currentDecimals: number, targetDecimals: number): BN {
    if (currentDecimals === targetDecimals) {
      return value;
    } else if (currentDecimals < targetDecimals) {
      const factor = new BN(10).pow(new BN(targetDecimals - currentDecimals));
      return value.multipliedBy(factor);
    } else {
      const factor = new BN(10).pow(new BN(currentDecimals - targetDecimals));
      return value.div(factor);
    }
  }

  static multiplyWithDifferentDecimals(a: BN, aDecimals: number, b: BN, bDecimals: number, resultDecimals: number): BN {
    const adjustedA = this.adjustDecimals(a, aDecimals, resultDecimals);
    const adjustedB = this.adjustDecimals(b, bDecimals, resultDecimals);
    return new BN(
      adjustedA
        .multipliedBy(adjustedB)
        .dividedToIntegerBy(new BN(10).pow(new BN(resultDecimals)))
        .toString(),
    );
  }

  static divideWithDifferentDecimals(a: BN, aDecimals: number, b: BN, bDecimals: number, resultDecimals: number): BN {
    if (a.isZero() || b.isZero()) return BN.ZERO;

    const adjustedA = this.adjustDecimals(a, aDecimals, resultDecimals);
    const adjustedB = this.adjustDecimals(b, bDecimals, resultDecimals);
    return new BN(adjustedA.multipliedBy(new BN(10).pow(new BN(resultDecimals))).dividedToIntegerBy(adjustedB));
  }
}

export default Math;
