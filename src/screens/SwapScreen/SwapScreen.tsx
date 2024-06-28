import React, { useState } from "react";
import { keyframes, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import ArrowDownIcon from "@src/assets/icons/arrowDown.svg?react";
import WalletIcon from "@src/assets/icons/wallet.svg?react";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@src/components/Text";
import { DEFAULT_DECIMALS } from "@src/constants";
import { useWallet } from "@src/hooks/useWallet";
import { useStores } from "@src/stores";
import { media } from "@src/themes/breakpoints";
import BN from "@src/utils/BN";
import { isValidAmountInput, parseNumberWithCommas, replaceComma } from "@src/utils/swapUtils";

import { InfoBlock } from "./InfoBlock";
import { PendingModal } from "./PendingModal";
import { SuccessModal } from "./SuccessModal";
import { TokenOption, TokenSelect } from "./TokenSelect";

const INPUT_FILL_OPTIONS = ["Half", "All"];

export const SwapScreen: React.FC = observer(() => {
  const { isConnected } = useWallet();
  const theme = useTheme();
  const { swapStore, oracleStore } = useStores();

  const [slippage, setSlippage] = useState(1);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [isPendingModalVisible, setPendingModalVisible] = useState(false); //TODO: set to true when transaction is pending

  const sellTokenOptions = swapStore.tokens.filter((token) => token.symbol !== swapStore.buyToken.symbol);
  const buyTokenOptions = swapStore.tokens.filter((token) => token.symbol !== swapStore.sellToken.symbol);

  const buyTokenPrice = swapStore.getPrice(swapStore.buyToken);

  const sellTokenPrice = swapStore.getPrice(swapStore.sellToken);
  const usdcPrice = swapStore.getPrice(swapStore.tokens.find((token) => token.symbol === "USDC") as TokenOption);

  const exchangeRate =
    BN.formatUnits(oracleStore.getTokenIndexPrice(swapStore.buyToken.priceFeed), DEFAULT_DECIMALS).toNumber() /
    BN.formatUnits(oracleStore.getTokenIndexPrice(swapStore.sellToken.priceFeed), DEFAULT_DECIMALS).toNumber();

  const onPayAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPayAmount = replaceComma(e.target.value);

    if (!isValidAmountInput(newPayAmount)) {
      return;
    }

    swapStore.setPayAmount(newPayAmount);

    const receiveAmount =
      Number(newPayAmount) * (parseNumberWithCommas(sellTokenPrice) / parseNumberWithCommas(buyTokenPrice));

    swapStore.setReceiveAmount(receiveAmount.toFixed(2));
  };

  const onReceivedTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newReceiveAmount = replaceComma(e.target.value);

    if (!isValidAmountInput(newReceiveAmount)) {
      return;
    }

    swapStore.setReceiveAmount(newReceiveAmount);

    const payAmount =
      Number(newReceiveAmount) * (parseNumberWithCommas(buyTokenPrice) / parseNumberWithCommas(sellTokenPrice));
    swapStore.setPayAmount(payAmount.toFixed(2));
  };

  const onSwitchTokens = () => {
    const temp = { ...swapStore.sellToken };
    swapStore.setSellToken(swapStore.buyToken as TokenOption);
    swapStore.setBuyToken(temp as TokenOption);
  };

  const fillPayAmount = (option: string) => {
    let newPayAmount = "";
    if (option === "Half") {
      const half = Number(swapStore.sellToken.balance) / 2;
      newPayAmount = half.toString();
    } else if (option === "All") {
      newPayAmount = swapStore.sellToken.balance;
    }

    swapStore.setPayAmount(newPayAmount);

    const receiveAmount =
      Number(newPayAmount) * (parseNumberWithCommas(sellTokenPrice) / parseNumberWithCommas(buyTokenPrice));

    swapStore.setReceiveAmount(receiveAmount.toFixed(6));
  };

  const swapTokens = () => {
    // setPendingModalVisible(true);
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
            <ActionContainer>
              <Text type={TEXT_TYPES.BODY}>Sell</Text>
              {isConnected && (
                <Actions>
                  {INPUT_FILL_OPTIONS.map((option) => (
                    <ActionTag key={option} onClick={() => fillPayAmount(option)}>
                      <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
                        {option}
                      </Text>
                    </ActionTag>
                  ))}
                </Actions>
              )}
            </ActionContainer>
            <TokenSelect
              options={sellTokenOptions}
              selectType="Sell"
              value={swapStore.sellToken}
              onSelect={(option) => swapStore.setSellToken(option)}
            />
          </BoxHeader>
          <SwapInput
            autoComplete="off"
            id="pay-amount"
            type="text"
            value={swapStore.payAmount}
            onChange={onPayAmountChange}
          />
          <BalanceSection>
            <Text type={TEXT_TYPES.BODY}>${Number(sellTokenPrice) * Number(swapStore.payAmount)}</Text>
            {isConnected ? (
              <Balance>
                <Text color={theme.colors.greenLight} type={TEXT_TYPES.BODY}>
                  {swapStore.sellToken.balance}
                </Text>
                <WalletIcon />
              </Balance>
            ) : null}
          </BalanceSection>
        </SwapBox>

        <SwitchTokens disabled={!isConnected} onClick={swapStore.onSwitchTokens}>
          <ArrowDownIcon />
        </SwitchTokens>

        <SwapBox>
          <BoxHeader>
            <Text type={TEXT_TYPES.BODY}>Buy</Text>
            <TokenSelect
              options={buyTokenOptions}
              selectType="Buy"
              value={swapStore.buyToken}
              onSelect={(option) => swapStore.setBuyToken(option)}
            />
          </BoxHeader>
          <SwapInput
            autoComplete="off"
            id="receive-amount"
            type="text"
            value={swapStore.receiveAmount}
            onChange={onReceivedTokensChange}
          />
          <BalanceSection>
            <Text type={TEXT_TYPES.BODY}>${Number(buyTokenPrice) * Number(swapStore.receiveAmount)}</Text>
            {isConnected ? (
              <Balance>
                <Text color={theme.colors.greenLight} type={TEXT_TYPES.BODY}>
                  {swapStore.buyToken.balance}
                </Text>
                <WalletIcon />
              </Balance>
            ) : null}
          </BalanceSection>
          <ExchangeRate>
            1 {swapStore.buyToken.symbol} = {exchangeRate.toFixed(5)} {swapStore.sellToken.symbol} (${buyTokenPrice})
          </ExchangeRate>
        </SwapBox>
      </SwapContainer>
      <InfoBlock slippage={slippage} updateSlippage={setSlippage} />
      <SwapButton disabled={!isConnected || !Number(swapStore.payAmount)} onClick={swapTokens}>
        Swap {swapStore.sellToken.symbol} to {swapStore.buyToken.symbol}
      </SwapButton>

      {isSuccessModalVisible && (
        <SuccessModal
          hash=""
          transactionInfo={{
            sellToken: swapStore.sellToken.symbol,
            buyToken: swapStore.buyToken.symbol,
            sellAmount: swapStore.payAmount,
            buyAmount: swapStore.receiveAmount,
          }}
          onClose={() => setSuccessModalVisible(false)}
        />
      )}

      {isPendingModalVisible && (
        <PendingModal
          transactionInfo={{
            sellToken: swapStore.sellToken.symbol,
            buyToken: swapStore.buyToken.symbol,
            sellAmount: swapStore.payAmount,
            buyAmount: swapStore.receiveAmount,
          }}
          onClose={() => setPendingModalVisible(false)}
        />
      )}
    </Root>
  );
});

const Root = styled.div`
  padding-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 16px;
  position: relative;
  width: 400px;

  ${media.mobile} {
    width: 100%;
    padding: 0 8px;
  }
`;

const TitleContainer = styled.div`
  margin-bottom: 16px;
`;

const textAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const Title = styled.h1`
  width: 70px;
  font-size: 28px !important;
  line-height: 1 !important;
  font-weight: 500;
  text-align: center;
  background: linear-gradient(to right, #fff, #ff9b57, #54bb94);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${textAnimation} 3s infinite;
  background-size: 300% 300%;
  color: transparent;
  margin: 0 auto 8px;
`;

const SwapContainer = styled.div`
  position: relative;
  width: 100%;
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
  margin-right: -12px;
`;

const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const ActionTag = styled.button`
  background-color: #00e38826;
  padding: 5px 6px;
  border-radius: 4px;
  outline: none;
  border: none;
  transition: background-color 0.2s;
  cursor: pointer;

  &:hover {
    background-color: #00e3884d;
  }

  &:active {
    background-color: #00e38873;
  }
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

  ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}
  font-size: 24px;

  ${media.mobile} {
    font-size: 24px;
  }
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

  ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SwitchTokens = styled.button<{ disabled: boolean }>`
  outline: none;
  border: none;
  position: absolute;
  left: calc(50% - 14px);
  top: 120px; // TODO: height of first section, check for mobile
  background-color: ${({ theme }) => theme.colors.greenLight};
  width: 28px;
  height: 44px;
  border-radius: 22px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};
  background-color: ${({ theme, disabled }) => (disabled ? theme.colors.borderSecondary : theme.colors.greenLight)};
  color: ${({ theme, disabled }) => (disabled ? theme.colors.iconDisabled : "#171717")};
  transition:
    border-radius 0.2s,
    transform 0.2s;

  &:hover {
    transform: scaleX(1.3);
    border-radius: 40%;

    svg {
      transform: scaleX(0.7692);
      transform-origin: center;
    }
  }

  &:active {
    background-color: #2effab;
  }

  svg {
    fill: ${({ theme, disabled }) => (disabled ? theme.colors.iconDisabled : "#171717")};
    transition:
      background-color 0.2s,
      transform 0.2s;
  }
`;

const SwapButton = styled.button`
  outline: none;
  border-radius: 16px;
  cursor: pointer;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.greenLight};
  background-color: ${({ theme }) => theme.colors.greenDark};
  transition: all 0.2s;
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: 16px 0;
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};

  &:disabled {
    color: ${({ theme }) => theme.colors.textDisabled};
    background-color: ${({ theme }) => theme.colors.borderSecondary};
    border: 1px solid ${({ theme }) => theme.colors.borderSecondary};
  }

  &:hover,
  &:active {
    background-color: ${({ theme }) => theme.colors.greenMedium};
  }
`;