import React from "react";
import styled from "@emotion/styled";

import Text, { TEXT_TYPES } from "@components/Text";

export const enum ACTION_MESSAGE_TYPE {
  MINTING_TEST_TOKENS,
  MINTING_TEST_TOKENS_FAILED,
  DEPOSITING_TOKENS,
  DEPOSITING_TOKENS_FAILED,
  WITHDRAWING_TOKENS,
  WITHDRAWING_ALL_TOKENS,
  WITHDRAWING_TOKENS_FAILED,
  CREATING_ORDER,
  CREATING_ORDER_FAILED,
  CANCELING_ORDER,
  CANCELING_ORDER_FAILED,
  CREATING_SWAP,
  CREATING_SWAP_FAILED,
  WITHDRAWING_ALL_TOKENS_FAILED,
  CREATING_ORDER_FAILED_INSTRUCTION,
}

type ActionMessageArgs = {
  [ACTION_MESSAGE_TYPE.MINTING_TEST_TOKENS]: [amount: string, symbol: string];
  [ACTION_MESSAGE_TYPE.WITHDRAWING_ALL_TOKENS]: [];
  [ACTION_MESSAGE_TYPE.WITHDRAWING_ALL_TOKENS_FAILED]: [];
  [ACTION_MESSAGE_TYPE.MINTING_TEST_TOKENS_FAILED]: [];
  [ACTION_MESSAGE_TYPE.DEPOSITING_TOKENS]: [amount: string, symbol: string];
  [ACTION_MESSAGE_TYPE.DEPOSITING_TOKENS_FAILED]: [amount: string, symbol: string];
  [ACTION_MESSAGE_TYPE.WITHDRAWING_TOKENS]: [amount: string, symbol: string];
  [ACTION_MESSAGE_TYPE.WITHDRAWING_TOKENS_FAILED]: [amount: string, symbol: string];
  [ACTION_MESSAGE_TYPE.CREATING_ORDER]: [amount: string, symbol: string, price: string, type: string];
  [ACTION_MESSAGE_TYPE.CREATING_ORDER_FAILED]: [];
  [ACTION_MESSAGE_TYPE.CREATING_SWAP]: [amountFrom: string, symbolFrom: string, amountTo: string, symbolTo: string];
  [ACTION_MESSAGE_TYPE.CREATING_SWAP_FAILED]: [
    amountFrom: string,
    symbolFrom: string,
    amountTo: string,
    symbolTo: string,
  ];
  [ACTION_MESSAGE_TYPE.CANCELING_ORDER]: [];
  [ACTION_MESSAGE_TYPE.CANCELING_ORDER_FAILED]: [];
  [ACTION_MESSAGE_TYPE.CREATING_ORDER_FAILED_INSTRUCTION]: [];
};

type ActionMessage = {
  [K in keyof ActionMessageArgs]: (...args: ActionMessageArgs[K]) => React.ReactElement;
};

const MESSAGE_TEMPLATES: ActionMessage = {
  [ACTION_MESSAGE_TYPE.MINTING_TEST_TOKENS]: (amount, symbol) => (
    <TextContainer type={TEXT_TYPES.BUTTON} greenLight>
      Test tokens minted&nbsp;
      <Text type={TEXT_TYPES.BUTTON} primary>
        {amount} {symbol}
      </Text>
    </TextContainer>
  ),
  [ACTION_MESSAGE_TYPE.MINTING_TEST_TOKENS_FAILED]: () => (
    <TextContainer type={TEXT_TYPES.BUTTON} attention>
      Minting failed
    </TextContainer>
  ),
  [ACTION_MESSAGE_TYPE.DEPOSITING_TOKENS]: (amount, symbol) => (
    <TextContainer type={TEXT_TYPES.BUTTON} greenLight>
      Deposited&nbsp;
      <Text type={TEXT_TYPES.BUTTON} primary>
        {amount} {symbol}
      </Text>
    </TextContainer>
  ),
  [ACTION_MESSAGE_TYPE.DEPOSITING_TOKENS_FAILED]: (amount, symbol) => (
    <TextContainer type={TEXT_TYPES.BUTTON} attention>
      Deposit of&nbsp;
      <Text type={TEXT_TYPES.BUTTON} primary>
        {amount} {symbol}
      </Text>
      &nbsp; failed
    </TextContainer>
  ),
  [ACTION_MESSAGE_TYPE.WITHDRAWING_ALL_TOKENS]: () => (
    <TextContainer type={TEXT_TYPES.BUTTON} greenLight>
      Withdrawn all successfully
    </TextContainer>
  ),
  [ACTION_MESSAGE_TYPE.WITHDRAWING_TOKENS]: (amount, symbol) => (
    <TextContainer type={TEXT_TYPES.BUTTON} greenLight>
      Withdrawn&nbsp;
      <Text type={TEXT_TYPES.BUTTON} primary>
        {amount} {symbol}
      </Text>
    </TextContainer>
  ),
  [ACTION_MESSAGE_TYPE.WITHDRAWING_ALL_TOKENS_FAILED]: () => (
    <TextContainer type={TEXT_TYPES.BUTTON} attention>
      Withdrawal failed
    </TextContainer>
  ),
  [ACTION_MESSAGE_TYPE.WITHDRAWING_TOKENS_FAILED]: (amount, symbol) => (
    <TextContainer type={TEXT_TYPES.BUTTON} attention>
      Withdrawal of&nbsp;
      <Text type={TEXT_TYPES.BUTTON} primary>
        {amount} {symbol}
      </Text>
      &nbsp; failed
    </TextContainer>
  ),
  [ACTION_MESSAGE_TYPE.CREATING_ORDER]: (amount, symbol, price, type) => (
    <TextContainer type={TEXT_TYPES.BUTTON} secondary>
      <Text type={TEXT_TYPES.BUTTON} greenLight>
        Order created
      </Text>
      &nbsp;to {type}&nbsp;
      <Text type={TEXT_TYPES.BUTTON} primary>
        {amount} {symbol}
      </Text>
      &nbsp;at&nbsp;
      <Text type={TEXT_TYPES.BUTTON} primary>
        ${price}
      </Text>
    </TextContainer>
  ),
  [ACTION_MESSAGE_TYPE.CREATING_ORDER_FAILED]: () => (
    <TextContainer type={TEXT_TYPES.BUTTON} attention>
      Order creation failed
    </TextContainer>
  ),
  [ACTION_MESSAGE_TYPE.CREATING_ORDER_FAILED_INSTRUCTION]: () => (
    <TextContainer type={TEXT_TYPES.BUTTON} attention>
      The order cannot be executed, please check the correctness of the order data entered.
    </TextContainer>
  ),
  [ACTION_MESSAGE_TYPE.CREATING_SWAP]: (amountFrom, symbolFrom, amountTo, symbolTo) => (
    <TextContainer type={TEXT_TYPES.BUTTON} secondary>
      <Text type={TEXT_TYPES.BUTTON} greenLight>
        Swap successful
      </Text>
      &nbsp;
      <Text type={TEXT_TYPES.BUTTON} primary>
        {amountFrom} {symbolFrom}
      </Text>
      &nbsp;&gt;&nbsp;
      <Text type={TEXT_TYPES.BUTTON} primary>
        {amountTo} {symbolTo}
      </Text>
    </TextContainer>
  ),
  [ACTION_MESSAGE_TYPE.CREATING_SWAP_FAILED]: (amountFrom, symbolFrom, amountTo, symbolTo) => (
    <TextContainer type={TEXT_TYPES.BUTTON} secondary>
      <Text type={TEXT_TYPES.BUTTON} attention>
        Swap failed
      </Text>
      &nbsp;
      <Text type={TEXT_TYPES.BUTTON} primary>
        {amountFrom} {symbolFrom}
      </Text>
      &nbsp;&gt;&nbsp;
      <Text type={TEXT_TYPES.BUTTON} primary>
        {amountTo} {symbolTo}
      </Text>
    </TextContainer>
  ),
  [ACTION_MESSAGE_TYPE.CANCELING_ORDER]: () => (
    <TextContainer type={TEXT_TYPES.BUTTON} greenLight>
      Order is closed
    </TextContainer>
  ),
  [ACTION_MESSAGE_TYPE.CANCELING_ORDER_FAILED]: () => (
    <TextContainer type={TEXT_TYPES.BUTTON} attention>
      Order closing failed
    </TextContainer>
  ),
};

const TextContainer = styled(Text)`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

export const getActionMessage = <T extends ACTION_MESSAGE_TYPE>(messageType: T) => {
  const template = MESSAGE_TEMPLATES[messageType];
  return (...args: ActionMessageArgs[T]) => template(...args);
};
