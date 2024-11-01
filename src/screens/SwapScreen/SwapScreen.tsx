import React, { useEffect, useMemo, useState } from "react";
import { keyframes, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button";
import { ConnectWalletButton } from "@components/ConnectWalletButton";
import { AssetBlockData } from "@components/SelectAssets/SelectAssetsInput";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { media } from "@themes/breakpoints";

import ArrowDownIcon from "@assets/icons/arrowDown.svg?react";
import Spinner from "@assets/icons/spinner.svg?react";

import { useMedia } from "@hooks/useMedia";
import { useWallet } from "@hooks/useWallet";
import { useStores } from "@stores";
import { MIXPANEL_EVENTS } from "@stores/MixPanelStore";

import { DEFAULT_DECIMALS, MINIMAL_ETH_REQUIRED, ROUTES } from "@constants";
import BN from "@utils/BN";
import { isValidAmountInput, parseNumberWithCommas, replaceComma } from "@utils/swapUtils";

import { Token } from "@entity";

import SwapButtonSkeletonWrapper from "../../components/Skeletons/SwapButtonSkeletonWrapper";
import SwapSkeletonWrapper from "../../components/Skeletons/SwapSkeletonWrapper";

import { BalanceSection } from "./BalanceSection";
import { InfoBlock } from "./InfoBlock";
import { TokenSelect } from "./TokenSelect";

const INITIAL_SLIPPAGE = 1;

export const SwapScreen: React.FC = observer(() => {
  const { swapStore, balanceStore, tradeStore, spotOrderBookStore, mixPanelStore, accountStore } = useStores();
  const { isConnected } = useWallet();
  const theme = useTheme();
  const media = useMedia();

  useEffect(() => {
    mixPanelStore.trackEvent(MIXPANEL_EVENTS.PAGE_VIEW, {
      page_name: ROUTES.SWAP,
      user_address: accountStore.address,
    });
  }, []);

  const [slippage, setSlippage] = useState(INITIAL_SLIPPAGE);
  const [isLoading, setIsloading] = useState(false);
  const [onPress, setOnPress] = useState(false);
  const tokens = swapStore.fetchNewTokens();
  const markets = tradeStore.spotMarkets;
  const buyTokenOptions = useMemo(() => {
    return markets
      .filter(
        (token) =>
          token.quoteToken.assetId === swapStore.sellToken.assetId ||
          token.baseToken.assetId === swapStore.sellToken.assetId,
      )
      .map((token) =>
        token.quoteToken.assetId === swapStore.sellToken.assetId
          ? tokens.find((el) => el.assetId === token.baseToken.assetId)
          : tokens.find((el) => el.assetId === token.quoteToken.assetId),
      )
      .filter((tokenOption): tokenOption is Token => tokenOption !== undefined);
  }, [swapStore.sellToken]);

  const buyTokenPrice = swapStore.getPrice(swapStore.buyToken);
  const sellTokenPrice = swapStore.getPrice(swapStore.sellToken);

  const payAmountUSD = Number(parseNumberWithCommas(sellTokenPrice)) * Number(swapStore.payAmount);
  const receiveAmountUSD = Number(parseNumberWithCommas(buyTokenPrice)) * Number(swapStore.receiveAmount);
  const isHaveExchangeFee = BN.formatUnits(MINIMAL_ETH_REQUIRED, DEFAULT_DECIMALS).isGreaterThan(
    balanceStore.getWalletNativeBalance(),
  );

  const dataOnboardingSwapKey = `swap-${media.mobile ? "mobile" : "desktop"}`;

  useEffect(() => {
    const updateToken = setInterval(async () => {
      swapStore.updateTokens();
    }, 1000);

    return () => clearInterval(updateToken);
  }, []);

  const generateBalanceData = (assets: Token[]) => {
    return balanceStore.formattedBalanceInfoList.filter((el) => assets.some((item) => item.assetId === el.assetId));
  };

  const onPayAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOnPress(false);
    const newPayAmount = replaceComma(e.target.value);

    if (!isValidAmountInput(newPayAmount)) {
      return;
    }

    swapStore.setPayAmount(newPayAmount);
    const isBuy = swapStore.isBuy;
    const price = !isBuy()
      ? spotOrderBookStore.buyOrders[0].price
      : spotOrderBookStore.sellOrders[spotOrderBookStore.sellOrders.length - 1].price;
    const receiveAmount = BN.parseUnits(new BN(newPayAmount).dividedBy(price), DEFAULT_DECIMALS);
    swapStore.setReceiveAmount(receiveAmount.toFixed(swapStore.buyToken.precision));
  };

  const onReceivedTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOnPress(false);
    const newReceiveAmount = replaceComma(e.target.value);

    if (!isValidAmountInput(newReceiveAmount)) {
      return;
    }

    swapStore.setReceiveAmount(newReceiveAmount);

    const isBuy = swapStore.isBuy;
    const price = !isBuy()
      ? spotOrderBookStore.buyOrders[0].price
      : spotOrderBookStore.sellOrders[spotOrderBookStore.sellOrders.length - 1].price;
    const payAmount = BN.parseUnits(new BN(newReceiveAmount).dividedBy(price), DEFAULT_DECIMALS);
    swapStore.setPayAmount(payAmount.toFixed(swapStore.sellToken.precision));
  };

  const fillPayAmount = () => {
    setOnPress(true);
    const balance = generateBalanceData([swapStore.sellToken])[0].balance;
    const newPayAmount = parseNumberWithCommas(balance.toString()).toFixed(swapStore.sellToken.precision);

    swapStore.setPayAmount(newPayAmount);

    const receiveAmount =
      Number(newPayAmount) * (parseNumberWithCommas(sellTokenPrice) / parseNumberWithCommas(buyTokenPrice));

    swapStore.setReceiveAmount(receiveAmount.toFixed(4));
  };

  const swapTokens = async () => {
    if (isLoading) return;
    const slippagePercentage = Number(slippage) * 100;
    setIsloading(true);
    try {
      const response = await swapStore.swapTokens({ slippage: slippagePercentage });
      setIsloading(false);
      if (response) {
        swapStore.setPayAmount("0");
        swapStore.setReceiveAmount("0");
      }
    } catch (err) {
      setIsloading(false);
      console.error("er", err);
    }
  };

  const balance = generateBalanceData([swapStore.sellToken])[0].balance;
  const isBalanceZero = Number(balance) === 0;
  const isLoaded = isConnected && balanceStore.initialized;

  const handleChangeMarketId = (tokenList: Token[], item: AssetBlockData, type: "buy" | "sell") => {
    const pair = tokenList.find((el) => el.assetId === item.assetId);
    if (!pair) return;
    const paris = swapStore.getTokenPair(pair.assetId);
    swapStore.setSellToken(type === "sell" ? pair : paris[0]);
    swapStore.setBuyToken(type === "sell" ? paris[0] : pair);
    swapStore.setPayAmount("0");
    swapStore.setReceiveAmount("0");
    const marketId = swapStore.getMarketPair(pair, paris[0]);
    if (!marketId) return;
    tradeStore.selectActiveMarket(marketId.symbol);
    balanceStore.update();
  };

  return (
    <Root>
      <Text>
        <Title>Swap</Title>
        <Text type={TEXT_TYPES.BUTTON}>Easiest way to trade assets on Fuel</Text>
      </Text>
      <SwapSkeletonWrapper isReady={true}>
        <SwapContainer>
          <SwapBox>
            <BoxHeader>
              <ActionContainer>
                <Text type={TEXT_TYPES.TEXT}>Sell</Text>
                {isLoaded && !isBalanceZero && (
                  <ActionTag onClick={fillPayAmount} onPress={onPress}>
                    <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON}>
                      Max
                    </Text>
                  </ActionTag>
                )}
              </ActionContainer>
              <TokenSelect
                assets={generateBalanceData(tokens)}
                selectedOption={generateBalanceData([swapStore.sellToken])[0]}
                showBalance="balance"
                type="rounded"
                onSelect={(item) => {
                  handleChangeMarketId(tokens, item, "sell");
                }}
              />
            </BoxHeader>
            <SwapInput
              autoComplete="off"
              id="pay-amount"
              type="text"
              value={swapStore.payAmount}
              onChange={onPayAmountChange}
            />
            {isLoaded && !isBalanceZero && (
              <BalanceSection
                balance={generateBalanceData([swapStore.sellToken])[0].balance}
                balanceUSD={payAmountUSD}
                handleMaxAmount={fillPayAmount}
                isLoaded={isLoaded}
              />
            )}
          </SwapBox>

          <SwitchTokens disabled={false} isLoaded={isLoaded && !isBalanceZero} onClick={swapStore.onSwitchTokens}>
            <ArrowDownIcon />
          </SwitchTokens>

          <SwapBox>
            <BoxHeader>
              <Text type={TEXT_TYPES.TEXT}>Buy</Text>
              <TokenSelect
                assets={generateBalanceData(buyTokenOptions)}
                selectedOption={generateBalanceData([swapStore.buyToken])[0]}
                showBalance="balance"
                type="rounded"
                onSelect={(item) => {
                  handleChangeMarketId(buyTokenOptions, item, "buy");
                }}
              />
            </BoxHeader>
            <SwapInput
              autoComplete="off"
              id="receive-amount"
              type="text"
              value={swapStore.receiveAmount}
              onChange={onReceivedTokensChange}
            />
            {isLoaded && !isBalanceZero && (
              <BalanceSection
                balance={generateBalanceData([swapStore.buyToken])[0]?.balance ?? "0"}
                balanceUSD={receiveAmountUSD}
                handleMaxAmount={fillPayAmount}
                isLoaded={isLoaded}
              />
            )}
          </SwapBox>
        </SwapContainer>
      </SwapSkeletonWrapper>
      <SwapButtonSkeletonWrapper isReady={true}>
        <SmartFlexStyled>
          <ConnectWalletButtonStyled connectText="Connect wallet to start trading" targetKey="swap_connect_btn">
            <SwapButton
              data-onboarding={dataOnboardingSwapKey}
              disabled={!isConnected || !Number(swapStore.payAmount) || !balanceStore.initialized || isBalanceZero}
              onClick={swapTokens}
            >
              <Text type={TEXT_TYPES.BUTTON_BIG}>
                {isLoading ? (
                  <Spinner height={14} />
                ) : (
                  `Swap ${swapStore.sellToken.symbol} to ${swapStore.buyToken.symbol}`
                )}
              </Text>
            </SwapButton>
          </ConnectWalletButtonStyled>
        </SmartFlexStyled>
      </SwapButtonSkeletonWrapper>
      {isLoaded && !isBalanceZero && <InfoBlock slippage={slippage} updateSlippage={setSlippage} />}
      {isLoaded && !isBalanceZero && isHaveExchangeFee && (
        <Text type={TEXT_TYPES.BUTTON} attention>
          Not enough ETH to pay an exchange fee
        </Text>
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
    margin-top: 42px;
  }
`;

const SmartFlexStyled = styled(SmartFlex)`
  width: 100%;
  ${media.mobile} {
    position: fixed;
    bottom: 40px;
    width: calc(100% - 16px);
  }
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

const ConnectWalletButtonStyled = styled(ConnectWalletButton)`
  ${TEXT_TYPES_MAP[TEXT_TYPES.BUTTON_BIG]}
  border-radius: 10px;
  padding: 12px 16px !important;
  height: 56px !important;
`;
const Title = styled.h1`
  width: 70px;
  font-size: 28px !important;
  line-height: 1 !important;
  font-weight: 500;
  text-align: center;
  background: linear-gradient(to right, #fff, #ff9b57, #54bb94);
  background-clip: text;
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
  border-radius: 4px 4px 10px 10px;
  background-color: #232323;
  padding: 16px 20px;
  &:first-of-type {
    margin-bottom: 4px;
    border-radius: 10px 10px 4px 4px;
  }
`;

const BoxHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  margin-right: -12px;
  height: 25px;
`;

const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const ActionTag = styled(Button)<{ onPress: boolean }>`
  padding: 5px !important;
  height: auto !important;
  width: auto !important;
  background: ${({ onPress }) => (onPress ? "#535353" : "#53535326")};
  border: none;
  border-radius: 4px;
  ${Text} {
    color: ${({ theme, onPress }) => (onPress ? "white" : theme.colors.textSecondary)};
  }
  &:hover {
    background: ${({ theme }) => theme.colors.textDisabled};
    ${Text} {
      color: ${({ theme }) => theme.colors.textPrimary};
    }
  }
`;

const SwapInput = styled.input`
  border: none;
  width: 100%;
  background: transparent;
  outline: none;
  color: white;

  ${TEXT_TYPES_MAP[TEXT_TYPES.H_NUMBERS]}

  ${media.mobile} {
    font-size: 24px;
  }
`;

const SwitchTokens = styled.button<{ disabled: boolean; isLoaded: boolean }>`
  outline: none;
  border: none;
  position: absolute;
  left: calc(50% - 14px);
  top: ${({ isLoaded }) => (isLoaded ? "112px" : "100px")}; // TODO: height of first section, check for mobile
  background-color: ${({ theme }) => theme.colors.greenLight};
  width: 28px;
  height: 44px;
  border-radius: 22px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow:
    0px 1px 1px 0px rgba(255, 255, 255, 0.77) inset,
    0px 2px 5px 0px rgba(0, 0, 0, 0.22),
    0px 16px 14px -6px rgba(21, 20, 21, 0.25),
    0px 1px 1px 0px rgba(255, 255, 255, 0.17) inset;
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};
  background-color: ${({ theme, disabled }) => (disabled ? theme.colors.borderSecondary : theme.colors.greenLight)};
  color: ${({ theme, disabled }) => (disabled ? theme.colors.iconDisabled : "#171717")};
  transition:
    border-radius 0.2s,
    transform 0.2s;

  &:hover {
    transform: scale(1.1);
    background: #2effab;
  }

  &:active {
    background-color: #6effc5;
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
  height: 56px;
  border: 1px solid ${({ theme }) => theme.colors.greenLight};
  background-color: ${({ theme }) => theme.colors.greenDark};
  transition: all 0.2s;
  padding: 16px 0;
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};
  ${Text} {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  &:disabled {
    ${Text} {
      color: ${({ theme }) => theme.colors.textDisabled};
    }
    background-color: ${({ theme }) => theme.colors.borderSecondary};
    border: 1px solid ${({ theme }) => theme.colors.borderSecondary};
  }

  &:hover,
  &:active {
    background-color: ${({ theme }) => theme.colors.greenMedium};
  }
`;
