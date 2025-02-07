import { isStableSymbol } from "./isStableSymbol";

export const toCurrency = (value: string, currency?: string) => {
  if (!currency || isStableSymbol(currency)) return `$${value}`;

  return `${value} ${currency}`;
};
