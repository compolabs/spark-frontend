import React, { useEffect, useMemo, useState } from "react";
import { keyframes, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";
import { MINIMAL_ETH_REQUIRED } from "@screens/TradeScreen/RightBlock/CreateOrder/CreateOrder";
import ArrowDownIcon from "@src/assets/icons/arrowDown.svg?react";
import Spinner from "@src/assets/icons/spinner.svg?react";
import { FuelNetwork } from "@src/blockchain";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@src/components/Text";
import { DEFAULT_DECIMALS } from "@src/constants";
import { useMedia } from "@src/hooks/useMedia";
import { useWallet } from "@src/hooks/useWallet";
import { useStores } from "@src/stores";
import { media } from "@src/themes/breakpoints";
import BN from "@src/utils/BN";
import { isValidAmountInput, parseNumberWithCommas, replaceComma } from "@src/utils/swapUtils";
import { BalanceSection } from "./BalanceSection";
import { InfoBlock } from "./InfoBlock";
import { TokenOption, TokenSelect } from "./TokenSelect";
import Button from "@components/Button";
import useFlag from "@src/hooks/useFlag";
import ConnectWalletDialog from "@screens/ConnectWallet";
import { SmartFlex } from "@components/SmartFlex";

const INITIAL_SLIPPAGE = 1;

export const SwapScreen: React.FC = observer(() => {
  const { isConnected } = useWallet();
  const theme = useTheme();
  const media = useMedia();
  const { swapStore, balanceStore, quickAssetsStore, tradeStore } = useStores();
  const [isConnectDialogVisible, openConnectDialog, closeConnectDialog] = useFlag();
  const bcNetwork = FuelNetwork.getInstance();
  const [slippage, setSlippage] = useState(INITIAL_SLIPPAGE);
  const [isLoading, setIsloading] = useState(false);
  const [onPress, setOnPress] = useState(false);
  const tokens = swapStore.fetchNewTokens();
  const markets = tradeStore.spotMarkets
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
      .filter((tokenOption): tokenOption is TokenOption => tokenOption !== undefined); // Type guard
  }, [swapStore.sellToken]);

  const getTokenPair = (assetId: string) => {
    return markets
      .filter((token) => token.quoteToken.assetId === assetId || token.baseToken.assetId === assetId)
      .map((token) =>
        token.quoteToken.assetId === assetId
          ? tokens.find((el) => el.assetId === token.baseToken.assetId)
          : tokens.find((el) => el.assetId === token.quoteToken.assetId),
      )
      .filter((tokenOption): tokenOption is TokenOption => tokenOption !== undefined); // Type guard
  };

  const buyTokenPrice = swapStore.getPrice(swapStore.buyToken);
  const sellTokenPrice = swapStore.getPrice(swapStore.sellToken);

  const payAmountUSD = Number(parseNumberWithCommas(sellTokenPrice)) * Number(swapStore.payAmount);
  const receiveAmountUSD = Number(parseNumberWithCommas(buyTokenPrice)) * Number(swapStore.receiveAmount);
  const nativeBalanceContract = balanceStore.getFormatContractBalanceInfo(
    bcNetwork.getTokenBySymbol("ETH").assetId,
    DEFAULT_DECIMALS,
  );
  const isHaveExchangeFee = BN.formatUnits(MINIMAL_ETH_REQUIRED, DEFAULT_DECIMALS).isGreaterThan(nativeBalanceContract);

  const dataOnboardingSwapKey = `swap-${media.mobile ? "mobile" : "desktop"}`;

  useEffect(() => {
    const updateToken = setInterval(async () => {
      swapStore.updateTokens();
    }, 1000);

    return () => clearInterval(updateToken);
  }, []);

  const generateBalanceData = (assets: TokenOption[]) =>
    assets.map(({ assetId }) => {
      const balance = Array.from(balanceStore.balances).find((el) => el[0] === assetId)?.[1] ?? BN.ZERO;
      const token = bcNetwork!.getTokenByAssetId(assetId);
      const contractBalance =
        token.symbol === "USDC" ? balanceStore.myMarketBalance.liquid.quote : balanceStore.myMarketBalance.liquid.base;
      const totalBalance = token.symbol === "ETH" ? balance : contractBalance.plus(balance);
      return {
        asset: token,
        walletBalance: BN.formatUnits(balance, token.decimals).toString(),
        contractBalance: BN.formatUnits(contractBalance, token.decimals).toString(),
        balance: BN.formatUnits(totalBalance, token.decimals).toString(),
        assetId,
      };
    });

  const getMarketPair = (baseAsset: TokenOption, queryAsset: TokenOption) => {
    return markets.find(el => el.baseToken.assetId === baseAsset.assetId && el.quoteToken.assetId === queryAsset.assetId || el.baseToken.assetId === queryAsset.assetId && el.quoteToken.assetId === baseAsset.assetId);
  }

  const onPayAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOnPress(false);
    const newPayAmount = replaceComma(e.target.value);

    if (!isValidAmountInput(newPayAmount)) {
      return;
    }

    swapStore.setPayAmount(newPayAmount);

    const receiveAmount =
      Number(newPayAmount) * (parseNumberWithCommas(sellTokenPrice) / parseNumberWithCommas(buyTokenPrice));
    swapStore.setReceiveAmount(receiveAmount.toFixed(swapStore.buyToken.precision));
  };

  const onReceivedTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOnPress(false);
    const newReceiveAmount = replaceComma(e.target.value);

    if (!isValidAmountInput(newReceiveAmount)) {
      return;
    }

    swapStore.setReceiveAmount(newReceiveAmount);

    const payAmount =
      Number(newReceiveAmount) * (parseNumberWithCommas(buyTokenPrice) / parseNumberWithCommas(sellTokenPrice));
    swapStore.setPayAmount(payAmount.toFixed(swapStore.sellToken.precision));
  };

  const fillPayAmount = () => {
    setOnPress(true);
    const newPayAmount = parseNumberWithCommas(swapStore.sellToken.balance).toFixed(swapStore.sellToken.precision);

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
      console.error("er", err);
    }
  };

  const isBalanceZero = Number(swapStore.sellToken.balance) === 0;
  const isLoaded = isConnected && balanceStore.initialized;

  const handleChangeMarketId = (tokenList: TokenOption[], i: number, type: "buy" | "sell") => {
    const paris = getTokenPair(tokenList[i].assetId)
    swapStore.setSellToken(type === "sell" ? tokenList[i] : paris[0]);
    swapStore.setBuyToken(type === "sell" ? paris[0] : tokenList[i]);
    const marketId = getMarketPair(tokenList[i], paris[0])
    if (!marketId) return
    tradeStore.selectActiveMarket(marketId.symbol)
    balanceStore.update()
  }

  return (
    <Root>
      <Text>
        <Title>Swap</Title>
        <Text type={TEXT_TYPES.BUTTON}>Easiest way to trade assets on Fuel</Text>
      </Text>
      <SwapContainer>
        <SwapBox>
          <BoxHeader>
            <ActionContainer>
              <Text type={TEXT_TYPES.TEXT_NEW}>Sell</Text>
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
              showBalance="contractBalance"
              type="rounded"
              onSelect={(_, i) => {
                handleChangeMarketId(tokens, i, "sell")
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
              balance={swapStore.sellToken.balance}
              balanceUSD={payAmountUSD}
              handleMaxAmount={fillPayAmount}
              isLoaded={isLoaded}
            />
          )}
        </SwapBox>

        <SwitchTokens
          disabled={!isConnected || !balanceStore.initialized || isBalanceZero}
          isLoaded={isLoaded && !isBalanceZero}
          onClick={swapStore.onSwitchTokens}
        >
          <ArrowDownIcon />
        </SwitchTokens>

        <SwapBox>
          <BoxHeader>
            <Text type={TEXT_TYPES.TEXT_NEW}>Buy</Text>
            <TokenSelect
              assets={generateBalanceData(buyTokenOptions)}
              selectedOption={generateBalanceData([swapStore.buyToken])[0]}
              showBalance="contractBalance"
              type="rounded"
              onSelect={(_, i) => {
                handleChangeMarketId(buyTokenOptions, i, "buy")
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
              balance={swapStore.buyToken.balance}
              balanceUSD={receiveAmountUSD}
              handleMaxAmount={fillPayAmount}
              isLoaded={isLoaded}
            />
          )}
        </SwapBox>
      </SwapContainer>
      <SmartFlexStyled>
        {isLoaded ? (
          <>
            {isBalanceZero ? (
              <SwapButton data-onboarding={dataOnboardingSwapKey} onClick={() => quickAssetsStore.setQuickAssets(true)}>
                <Text type={TEXT_TYPES.BUTTON_BIG_NEW}>Deposit funds to make swap</Text>
              </SwapButton>
            ) : (
              <SwapButton
                data-onboarding={dataOnboardingSwapKey}
                disabled={!isConnected || !Number(swapStore.payAmount) || !balanceStore.initialized || isBalanceZero}
                onClick={swapTokens}
              >
                <Text type={TEXT_TYPES.BUTTON_BIG_NEW}>
                  {isLoading ? (
                    <Spinner height={14} />
                  ) : (
                    `Swap ${swapStore.sellToken.symbol} to ${swapStore.buyToken.symbol}`
                  )}
                </Text>
              </SwapButton>
            )}
          </>
        ) : (
          <ButtonBordered green onClick={openConnectDialog}>
            <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON_BIG_NEW}>
              Connect wallet to start trading
            </Text>
          </ButtonBordered>
        )}
      </SmartFlexStyled>
      {isLoaded && !isBalanceZero && <InfoBlock slippage={slippage} updateSlippage={setSlippage} />}
      {isLoaded && !isBalanceZero && isHaveExchangeFee && (
        <Text type={TEXT_TYPES.BUTTON} attention>
          Not enough ETH to pay an exchange fee
        </Text>
      )}
      {isConnectDialogVisible ? (
        <ConnectWalletDialog visible={isConnectDialogVisible} onClose={closeConnectDialog} />
      ) : null}
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

const ButtonBordered = styled(Button)`
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

  ${TEXT_TYPES_MAP[TEXT_TYPES.H_NUMBERS_NEW]}

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
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};
  background-color: ${({ theme, disabled }) => (disabled ? theme.colors.borderSecondary : theme.colors.greenLight)};
  color: ${({ theme, disabled }) => (disabled ? theme.colors.iconDisabled : "#171717")};
  transition:
    border-radius 0.2s,
    transform 0.2s;

  &:hover {
    transform: scale(1.25);
    //border-radius: 40%;

    svg {
      transform: scale(1.25);
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
