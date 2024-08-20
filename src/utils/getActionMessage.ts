export const enum ACTION_MESSAGE_TYPE {
  MINTING_TEST_TOKENS,
  DEPOSITING_TOKENS,
  WITHDRAWING_TOKENS,
  CREATING_ORDER,
  CANCELING_ORDER,
}

const MESSAGE_ACTION_FUNCTION = {
  [ACTION_MESSAGE_TYPE.MINTING_TEST_TOKENS]: (amount: string, tokenSymbol: string) =>
    `Successfully minted ${amount} ${tokenSymbol} test tokens.`,
  [ACTION_MESSAGE_TYPE.DEPOSITING_TOKENS]: (amount: string, tokenSymbol: string) =>
    `Successfully deposited ${amount} ${tokenSymbol} tokens.`,
  [ACTION_MESSAGE_TYPE.WITHDRAWING_TOKENS]: (amount: string, tokenSymbol: string) =>
    `Successfully withdrew ${amount} ${tokenSymbol} tokens.`,
  [ACTION_MESSAGE_TYPE.CREATING_ORDER]: (amount: string, tokenSymbol: string) =>
    `Successfully created an order for ${amount} ${tokenSymbol}.`,
  [ACTION_MESSAGE_TYPE.CANCELING_ORDER]: (amount: string, tokenSymbol: string) =>
    `Successfully canceled the order for ${amount} ${tokenSymbol}.`,
};

export const getActionMessage = (messageType: ACTION_MESSAGE_TYPE) => {
  return MESSAGE_ACTION_FUNCTION[messageType];
};
