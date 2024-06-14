import React, { useState } from "react";
import styled from "@emotion/styled";

import Text, { TEXT_TYPES } from "@src/components/Text";
import { isValidAmountInput, replaceComma } from "@src/utils/swapUtils";

export const SwapScreen: React.FC = () => {
  const [payAmount, setPayAmount] = useState<string>("0.00");
  const [receiveAmount, setReceiveAmount] = useState<string>("0.00");

  const onPayAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPayAmount = replaceComma(e.target.value);

    if (!isValidAmountInput(newPayAmount)) {
      return;
    }

    setPayAmount(newPayAmount);
  };

  const onReceivedTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newReceiveAmount = replaceComma(e.target.value);

    if (!isValidAmountInput(newReceiveAmount)) {
      return;
    }

    setReceiveAmount(newReceiveAmount);
  };

  return (
    <Root>
      <TitleContainer>
        <Title>Swap</Title>
        <Text type={TEXT_TYPES.H}>Easiest way to trade assets on Fuel</Text>
      </TitleContainer>
      <SwapContainer>
        <SwapBox>
          <BoxHeader>
            <Actions>Sell Half All</Actions>
            <TokenSelect>Icon + Token title select</TokenSelect>
          </BoxHeader>
          <SwapInput autoComplete="off" id="pay-amount" type="text" value={payAmount} onChange={onPayAmountChange} />
          <BalanceSection>
            <Text type={TEXT_TYPES.BODY}>$0.00</Text>
            <Text type={TEXT_TYPES.BODY}>wallet icon Balance</Text>
          </BalanceSection>
        </SwapBox>
        <SwapBox>
          <BoxHeader>Buy</BoxHeader>
          <SwapInput
            autoComplete="off"
            id="receive-amount"
            type="text"
            value={receiveAmount}
            onChange={onReceivedTokensChange}
          />
          <BalanceSection>
            <Text type={TEXT_TYPES.BODY}>$0.00</Text>
            <Text type={TEXT_TYPES.BODY}>wallet icon Balance</Text>
          </BalanceSection>
        </SwapBox>
      </SwapContainer>
    </Root>
  );
};

const Root = styled.div`
  padding-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 16px;
`;

const TitleContainer = styled.div`
  margin-bottom: 16px;
`;

const Title = styled.h1`
  width: 70px;
  font-size: 28px !important;
  line-height: 1 !important;
  font-weight: 500;
  text-align: center;
  background: linear-gradient(to right, #fff, #ff9b57, #54bb94);
  -webkit-background-clip: text;
  color: transparent;
  margin: 0 auto 8px;
`;

const SwapContainer = styled.div`
  position: relative;
  width: 400px;
`;

const SwapBox = styled.div`
  border-radius: 8px 8px 16px 16px;
  background-color: #232323;
  padding: 16px 20px;
  &:first-of-type {
    margin-bottom: 4px;
    border-radius: 16px 16px 8px 8px;
  }
`;

const BoxHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const TokenSelect = styled.div`
  border-radius: 30px;
  background: #0000004d;
  padding: 8px;
`;

const SwapInput = styled.input`
  border: none;
  width: 100%;
  background: transparent;
  outline: none;
  color: white;
  font-size: 24px;
`;

const BalanceSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
