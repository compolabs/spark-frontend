export const enum ACTION_MESSAGE_TYPE {
  MINTING_TEST_TOKENS,
  MINTING_TEST_TOKENS_FAILED,
  DEPOSITING_TOKENS,
  DEPOSITING_TOKENS_FAILED,
  WITHDRAWING_TOKENS,
  WITHDRAWING_TOKENS_FAILED,
  CREATING_ORDER,
  CREATING_ORDER_FAILED,
  CANCELING_ORDER,
  CANCELING_ORDER_FAILED,
}

type ActionMessageArgs = {
  [ACTION_MESSAGE_TYPE.MINTING_TEST_TOKENS]: [amount: string, tokenSymbol: string];
  [ACTION_MESSAGE_TYPE.MINTING_TEST_TOKENS_FAILED]: [reason: string];
  [ACTION_MESSAGE_TYPE.DEPOSITING_TOKENS]: [amount: string, tokenSymbol: string];
  [ACTION_MESSAGE_TYPE.DEPOSITING_TOKENS_FAILED]: [amount: string, tokenSymbol: string, reason: string];
  [ACTION_MESSAGE_TYPE.WITHDRAWING_TOKENS]: [amount: string, tokenSymbol: string];
  [ACTION_MESSAGE_TYPE.WITHDRAWING_TOKENS_FAILED]: [amount: string, tokenSymbol: string, reason: string];
  [ACTION_MESSAGE_TYPE.CREATING_ORDER]: [amount: string, tokenSymbol: string, price: string];
  [ACTION_MESSAGE_TYPE.CREATING_ORDER_FAILED]: [reason: string];
  [ACTION_MESSAGE_TYPE.CANCELING_ORDER]: [];
  [ACTION_MESSAGE_TYPE.CANCELING_ORDER_FAILED]: [reason: string];
};

type ActionMessageCreator<T extends ACTION_MESSAGE_TYPE> = (...args: ActionMessageArgs[T]) => string;

const MESSAGE_TEMPLATES: { [K in ACTION_MESSAGE_TYPE]: string } = {
  [ACTION_MESSAGE_TYPE.MINTING_TEST_TOKENS]: "Successfully minted {amount} {symbol} test tokens.",
  [ACTION_MESSAGE_TYPE.MINTING_TEST_TOKENS_FAILED]: "Minting failed: {reason}",
  [ACTION_MESSAGE_TYPE.DEPOSITING_TOKENS]: "{amount} {symbol} deposited successfully.",
  [ACTION_MESSAGE_TYPE.DEPOSITING_TOKENS_FAILED]: "Deposit of {amount} {symbol} failed: {reason}",
  [ACTION_MESSAGE_TYPE.WITHDRAWING_TOKENS]: "{amount} {symbol} withdrawn successfully.",
  [ACTION_MESSAGE_TYPE.WITHDRAWING_TOKENS_FAILED]: "Withdrawal of {amount} {symbol} failed: {reason}",
  [ACTION_MESSAGE_TYPE.CREATING_ORDER]: "Order created successfully to sell {amount} {symbol} at {price}.",
  [ACTION_MESSAGE_TYPE.CREATING_ORDER_FAILED]: "Order creation failed: {reason}",
  [ACTION_MESSAGE_TYPE.CANCELING_ORDER]: "Order closed successfully.",
  [ACTION_MESSAGE_TYPE.CANCELING_ORDER_FAILED]: "Order canceling failed: {reason}.",
};

const formatMessage = <T extends ACTION_MESSAGE_TYPE>(template: string, args: ActionMessageArgs[T]): string => {
  let index = 0;
  return template.replace(/{(\S+)}/g, () => args[index++] || "");
};

export const getActionMessage = <T extends ACTION_MESSAGE_TYPE>(messageType: T): ActionMessageCreator<T> => {
  const template = MESSAGE_TEMPLATES[messageType];
  return (...args: ActionMessageArgs[T]) => formatMessage(template, args);
};
