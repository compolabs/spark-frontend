export function isValidAmountInput(value: string): boolean {
  if (!/^[0-9]*\.?[0-9]*$/.test(value)) {
    return false;
  }
  return true;
}

export function replaceComma(value: string): string {
  return value.replace(",", ".");
}

export function parseNumberWithCommas(str: string): number {
  return parseFloat(str.replace(/,/g, ""));
}
