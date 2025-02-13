const DOLLAR_SYMBOLS = new Set(["USDC", "USDT"]);

export const isStableSymbol = (symbol: string) => {
  return DOLLAR_SYMBOLS.has(symbol);
};
