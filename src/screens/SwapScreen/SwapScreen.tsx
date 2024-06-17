import React, { useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import arrowDownIcon from "@src/assets/icons/arrowDown.svg";
import { ReactComponent as WalletIcon } from "@src/assets/icons/wallet.svg";
import { TOKENS_LIST } from "@src/blockchain/constants";
import Text, { TEXT_TYPES } from "@src/components/Text";
import { useStores } from "@src/stores";
import { isValidAmountInput, replaceComma } from "@src/utils/swapUtils";

import { TokenOption, TokenSelect } from "./TokenSelect";

export const SwapScreen: React.FC = () => {
  const theme = useTheme();
  const { accountStore, balanceStore, faucetStore } = useStores();
  const [payAmount, setPayAmount] = useState<string>("0.00");
  const [receiveAmount, setReceiveAmount] = useState<string>("0.00");

  const sellTokenOptions = TOKENS_LIST.map((token) => ({
    key: token.symbol,
    title: token.name,
    img: token.logo,
    symbol: token.symbol,
  }));

  const [sellToken, setSellToken] = useState<TokenOption>(sellTokenOptions[0]);
  const [buyToken, setBuyToken] = useState<TokenOption>(sellTokenOptions[1]);

  const exchangeRate = 3653; // TODO: get exchange rate from API

  console.log(Array.from(faucetStore.faucetTokens));

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
            <TokenSelect options={sellTokenOptions} value={sellToken} onSelect={() => {}} />
          </BoxHeader>
          <SwapInput autoComplete="off" id="pay-amount" type="text" value={payAmount} onChange={onPayAmountChange} />
          <BalanceSection>
            <Text type={TEXT_TYPES.BODY}>$0.00</Text>
            {accountStore.address ? (
              <Balance>
                <Text color={theme.colors.greenLight} type={TEXT_TYPES.BODY}>
                  320
                </Text>
                <WalletIcon />
              </Balance>
            ) : null}
          </BalanceSection>
        </SwapBox>

        <SwitchTokens>
          <img alt="arrow down" src={arrowDownIcon} />
        </SwitchTokens>

        <SwapBox>
          <BoxHeader>
            <Text type={TEXT_TYPES.BODY}>Buy</Text>
            <TokenSelect options={sellTokenOptions} value={buyToken} onSelect={() => {}} />
          </BoxHeader>
          <SwapInput
            autoComplete="off"
            id="receive-amount"
            type="text"
            value={receiveAmount}
            onChange={onReceivedTokensChange}
          />
          <BalanceSection>
            <Text type={TEXT_TYPES.BODY}>$0.00</Text>
            {accountStore.address ? (
              <Balance>
                <Text color={theme.colors.greenLight} type={TEXT_TYPES.BODY}>
                  0.15
                </Text>
                <WalletIcon />
              </Balance>
            ) : null}
          </BalanceSection>
          <ExchangeRate>
            <Text type={TEXT_TYPES.BODY}>1 ETH = {exchangeRate}($...) </Text>
          </ExchangeRate>
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
  position: relative;
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
  padding: 16px 8px 16px 20px;
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

const Balance = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ExchangeRate = styled.div`
  background: #0000004d;
  border-radius: 33px;
  text-align: center;
  margin-top: 32px;
  padding: 9px 0;
`;

const SwitchTokens = styled.div`
  position: absolute;
  background-color: ${({ theme }) => theme.colors.greenLight};
  width: 28px;
  height: 44px;
  border-radius: 22px;
  transition: 0.4s;
`;
