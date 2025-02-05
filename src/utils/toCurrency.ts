const DOLLAR_SYMBOLS = new Set(["USDC", "USDT"]);

export const toCurrency = (value: string, currency?: string) => {
  if (!currency || DOLLAR_SYMBOLS.has(currency)) return `$${value}`;

  return `${value} ${currency}`;
};
