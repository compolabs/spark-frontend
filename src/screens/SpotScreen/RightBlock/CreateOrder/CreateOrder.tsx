import React from "react";
import styled from "@emotion/styled";
import { Accordion } from "@szhsin/react-accordion";
import { observer } from "mobx-react-lite";

import { BN, LimitType } from "@compolabs/spark-orderbook-ts-sdk";

import AccordionItem from "@components/AccordionItem";
import Button, { ButtonGroup } from "@components/Button";
import { ConnectWalletButton } from "@components/ConnectWalletButton";
import { Row } from "@components/Flex";
import MaxButton from "@components/MaxButton";
import { RadioButton } from "@components/RadioButton";
import Select from "@components/Select";
import SizedBox from "@components/SizedBox";
import CreateOrderSkeletonWrapper from "@components/Skeletons/CreateOrderSkeletonWrapper";
import Slider from "@components/Slider";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import TokenInput from "@components/TokenInput";
import { media } from "@themes/breakpoints";

import useFlag from "@hooks/useFlag";
import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";
import { MIXPANEL_EVENTS } from "@stores/MixPanelStore";
import { ACTIVE_INPUT, ORDER_MODE, ORDER_TYPE } from "@stores/SpotCreateOrderStore";

import { DEFAULT_DECIMALS, MINIMAL_ETH_REQUIRED } from "@constants";
import { getRealFee } from "@utils/getRealFee";

import { OrderTypeSheet, OrderTypeTooltip, OrderTypeTooltipIcon } from "./OrderTypeTooltip";

export const ORDER_OPTIONS = [
  // { title: "Market", key: ORDER_TYPE.Market, timeInForce: LimitType.FOK },
  { title: "Limit", key: ORDER_TYPE.Limit, timeInForce: LimitType.GTC },
  // { title: "Limit (IOC)", key: ORDER_TYPE.LimitIOC, timeInForce: LimitType.IOC },
  // { title: "Limit (FOK)", key: ORDER_TYPE.LimitFOK, timeInForce: LimitType.FOK },
];

const VISIBLE_MARKET_DECIMALS = 2;

const CreateOrder: React.FC = observer(() => {
  const {
    balanceStore,
    marketStore,
    settingsStore,
    spotOrderBookStore,
    mixPanelStore,
    spotCreateOrderStore,
    spotMarketInfoStore,
  } = useStores();
  const media = useMedia();

  const timeInForce = settingsStore.timeInForce;
  const market = marketStore.market;

  const dataOnboardingTradingKey = `trade-${media.mobile ? "mobile" : "desktop"}`;

  const isButtonDisabled = spotCreateOrderStore.isLoading || !spotCreateOrderStore.canProceed;
  const isMarketOrderType = settingsStore.orderType === ORDER_TYPE.Market;
  const priceDisplayDecimals = isMarketOrderType ? VISIBLE_MARKET_DECIMALS : DEFAULT_DECIMALS;

  const [isOrderTooltipOpen, openOrderTooltip, closeOrderTooltip] = useFlag();

  if (!market) return null;

  const { baseToken, quoteToken } = market;

  const handlePercentChange = (v: number) => {
    const token = spotCreateOrderStore.isSell ? baseToken : quoteToken;

    const totalBalance = balanceStore.getSpotTotalBalance(token.assetId);

    if (totalBalance.isZero()) return;

    const value = BN.percentOf(totalBalance, v);

    if (spotCreateOrderStore.isSell) {
      spotCreateOrderStore.setInputAmount(value);
      return;
    }

    spotCreateOrderStore.setInputTotal(value);
  };

  const handleSetOrderType = (type: ORDER_TYPE) => {
    settingsStore.setOrderType(type);
  };

  const handleSetTimeInForce = (timeInForce: LimitType) => {
    settingsStore.setTimeInForce(timeInForce);
  };

  const handleSetPrice = (amount: BN) => {
    if (settingsStore.orderType === ORDER_TYPE.Market) return;

    spotCreateOrderStore.setInputPrice(amount);
  };

  const handleSetSlippage = (slippage: BN) => {
    spotCreateOrderStore.setInputSlippage(slippage);
  };

  const createOrder = () => {
    spotCreateOrderStore.createOrder();
  };

  const disabledOrderTypes = [ORDER_TYPE.Limit, ORDER_TYPE.LimitFOK, ORDER_TYPE.LimitIOC];
  const isInputPriceDisabled = !disabledOrderTypes.includes(settingsStore.orderType);

  const fee = getRealFee(
    marketStore.market,
    spotMarketInfoStore.matcherFee,
    spotMarketInfoStore.exchangeFee,
    spotCreateOrderStore.isSell,
  );

  const renderButton = () => {
    const isEnoughGas = balanceStore.getWalletNativeBalance().gt(MINIMAL_ETH_REQUIRED);
    const minimalOrder = spotMarketInfoStore.minimalOrder;
    const formatMinimalAmount = BN.formatUnits(minimalOrder.minOrder.toString(), DEFAULT_DECIMALS).toString();
    const formatMinimalPrice = BN.formatUnits(minimalOrder.minPrice.toString(), DEFAULT_DECIMALS).toString();

    if (!isButtonDisabled && spotMarketInfoStore.isFeeLoading) {
      return (
        <CreateOrderButton disabled>
          <Text type={TEXT_TYPES.BUTTON}>Loading...</Text>
        </CreateOrderButton>
      );
    }

    if (!isButtonDisabled && !spotMarketInfoStore.getIsEnoughtMoneyForFee(spotCreateOrderStore.isSell)) {
      return (
        <CreateOrderButton disabled>
          <Text type={TEXT_TYPES.BUTTON}>Insufficient {quoteToken.symbol} for fee</Text>
        </CreateOrderButton>
      );
    }

    if (!isButtonDisabled && !isEnoughGas) {
      return (
        <CreateOrderButton disabled>
          <Text type={TEXT_TYPES.BUTTON}>Insufficient ETH for gas</Text>
        </CreateOrderButton>
      );
    }

    if (spotCreateOrderStore.inputAmount.lt(minimalOrder.minOrder)) {
      return (
        <CreateOrderButton disabled>
          <Text type={TEXT_TYPES.BUTTON}>Minimum amount {formatMinimalAmount}</Text>
        </CreateOrderButton>
      );
    }

    if (spotCreateOrderStore.inputPrice.lt(minimalOrder.minPrice)) {
      return (
        <CreateOrderButton disabled>
          <Text type={TEXT_TYPES.BUTTON}>Minimum price {formatMinimalPrice}</Text>
        </CreateOrderButton>
      );
    }

    return (
      <CreateOrderButton
        data-onboarding={dataOnboardingTradingKey}
        disabled={isButtonDisabled}
        green={!spotCreateOrderStore.isSell}
        red={spotCreateOrderStore.isSell}
        onClick={createOrder}
      >
        <Text primary={!isButtonDisabled} type={TEXT_TYPES.BUTTON}>
          {spotCreateOrderStore.isLoading
            ? "Loading..."
            : spotCreateOrderStore.isSell
              ? `Sell ${baseToken.symbol}`
              : `Buy ${baseToken.symbol}`}
        </Text>
      </CreateOrderButton>
    );
  };

  const renderOrderTooltip = () => {
    if (media.mobile) {
      return <OrderTypeTooltipIcon text="Info" onClick={openOrderTooltip} />;
    }

    return <OrderTypeTooltip />;
  };

  const renderInstruction = () => {
    if (settingsStore.orderType === ORDER_TYPE.Market) return <></>;
    const handleChangeTimeInForce = (e: any) => {
      settingsStore.setTimeInForce(e);
    };
    return (
      <Accordion transitionTimeout={400} transition>
        <AccordionItem
          header={
            <Row alignItems="center" justifyContent="space-between" mainAxisSize="stretch">
              <Text type={TEXT_TYPES.BUTTON_SECONDARY} nowrap primary>
                Instruction
              </Text>
              <Row alignItems="center" justifyContent="flex-end">
                <Text>{timeInForce}</Text>
              </Row>
            </Row>
          }
          defaultChecked
        >
          <SmartFlex alignItems="center" gap="10px" justifyContent="space-between">
            <RadioButton
              isSelected={timeInForce === LimitType.GTC}
              label="GTC"
              value={LimitType.GTC}
              onChange={handleChangeTimeInForce}
            />
            <Row alignItems="center">
              <Text nowrap>(Good-Till-Cancelled)</Text>
            </Row>
          </SmartFlex>
          <SmartFlex alignItems="center" gap="10px" justifyContent="space-between">
            <RadioButton
              isSelected={timeInForce === LimitType.IOC}
              label="IOC"
              value={LimitType.IOC}
              onChange={handleChangeTimeInForce}
            />
            <Row alignItems="center">
              <Text nowrap>(Immidiate-Or-Cancel)</Text>
            </Row>
          </SmartFlex>
          <SmartFlex alignItems="center" gap="10px" justifyContent="space-between">
            <RadioButton
              isSelected={timeInForce === LimitType.FOK}
              label="FOK"
              value={LimitType.FOK}
              onChange={handleChangeTimeInForce}
            />
            <Row alignItems="center">
              <Text nowrap>(Fill-Or-Kill)</Text>
            </Row>
          </SmartFlex>
        </AccordionItem>
      </Accordion>
    );
  };

  const renderOrderDetails = () => {
    return (
      <Accordion transitionTimeout={400} transition>
        <AccordionItem
          header={
            <Row alignItems="center" justifyContent="space-between" mainAxisSize="stretch">
              <Text type={TEXT_TYPES.BUTTON_SECONDARY} nowrap primary>
                Order Details
              </Text>
              <Row alignItems="center" justifyContent="flex-end">
                <Text primary>
                  {BN.formatUnits(spotCreateOrderStore.inputAmount, baseToken.decimals).toSignificant(4)}
                </Text>
                <Text>&nbsp;{baseToken.symbol}</Text>
              </Row>
            </Row>
          }
          defaultChecked
          initialEntered
          onTransitionEnd={(e) => {
            if (e.target instanceof HTMLElement && e.propertyName === "height") {
              mixPanelStore.trackEvent(MIXPANEL_EVENTS.CLICK_FEE_ACCORDION);
            }
          }}
        >
          <Row alignItems="center" justifyContent="space-between">
            <Text nowrap>Max {spotCreateOrderStore.isSell ? "sell" : "buy"}</Text>
            <Row alignItems="center" justifyContent="flex-end">
              <Text primary>{BN.formatUnits(spotCreateOrderStore.inputTotal, quoteToken.decimals).toFormat(2)}</Text>
              <Text>&nbsp;{quoteToken.symbol}</Text>
            </Row>
          </Row>
          <Row alignItems="center" justifyContent="space-between">
            <Text nowrap>Matcher Fee</Text>
            <Row alignItems="center" justifyContent="flex-end">
              <Text primary>{fee.matcherFeeFormat.toSignificant(2)}</Text>
              <Text>&nbsp;{quoteToken.symbol}</Text>
            </Row>
          </Row>
          <Row alignItems="center" justifyContent="space-between">
            <Text nowrap>Exchange Fee</Text>
            <Row alignItems="center" justifyContent="flex-end">
              <Text primary>{fee.exchangeFeeFormat.toSignificant(2)}</Text>
              <Text>&nbsp;{quoteToken.symbol}</Text>
            </Row>
          </Row>
          <Row alignItems="center" justifyContent="space-between">
            <Text nowrap>Total amount</Text>
            <Row alignItems="center" justifyContent="flex-end">
              <Text primary>
                {BN.formatUnits(spotCreateOrderStore.inputAmount, baseToken.decimals).toSignificant(4)}
              </Text>
              <Text>&nbsp;{baseToken.symbol}</Text>
            </Row>
          </Row>
        </AccordionItem>
      </Accordion>
    );
  };

  const getAvailableAmount = () => {
    const token = spotCreateOrderStore.isSell ? baseToken : quoteToken;
    return balanceStore.getSpotFormatTotalBalance(token.assetId, token.decimals);
  };

  const onSelectOrderType = ({ key }: { key: ORDER_TYPE }) => {
    handleSetOrderType(key);
    const elementOption = ORDER_OPTIONS.find((el) => el.key === key);
    elementOption && handleSetTimeInForce(elementOption.timeInForce);
  };
  return (
    <CreateOrderSkeletonWrapper isReady={!spotOrderBookStore.isOrderBookLoading}>
      <Root column>
        <ButtonGroup>
          <Button
            active={!spotCreateOrderStore.isSell}
            onClick={() => spotCreateOrderStore.setOrderMode(ORDER_MODE.BUY)}
          >
            <Text primary={!spotCreateOrderStore.isSell} type={TEXT_TYPES.BUTTON_SECONDARY}>
              buy
            </Text>
          </Button>
          <Button
            active={spotCreateOrderStore.isSell}
            onClick={() => spotCreateOrderStore.setOrderMode(ORDER_MODE.SELL)}
          >
            <Text primary={spotCreateOrderStore.isSell} type={TEXT_TYPES.BUTTON_SECONDARY}>
              sell
            </Text>
          </Button>
        </ButtonGroup>
        <ParamsContainer>
          <StyledRow>
            <SelectOrderTypeContainer>
              <Select
                label="Order type"
                options={ORDER_OPTIONS}
                selected={settingsStore.orderType}
                onSelect={onSelectOrderType}
              />
              {renderOrderTooltip()}
            </SelectOrderTypeContainer>
            {settingsStore.orderType === ORDER_TYPE.Limit && (
              <TokenInput
                amount={spotCreateOrderStore.inputPrice}
                decimals={DEFAULT_DECIMALS}
                disabled={isInputPriceDisabled}
                displayDecimals={priceDisplayDecimals}
                label="Price"
                setAmount={handleSetPrice}
                onBlur={spotCreateOrderStore.setActiveInput}
                onFocus={() => spotCreateOrderStore.setActiveInput(ACTIVE_INPUT.Price)}
              />
            )}
          </StyledRow>
          <InputContainerWithError>
            <TokenInput
              amount={spotCreateOrderStore.inputAmount}
              assetId={baseToken.assetId}
              decimals={baseToken.decimals}
              error={
                spotCreateOrderStore.isSell || settingsStore.orderType === ORDER_TYPE.Market
                  ? spotCreateOrderStore.isInputError
                  : undefined
              }
              errorMessage={`Not enough ${baseToken.symbol}`}
              label="Order size"
              setAmount={spotCreateOrderStore.setInputAmount}
              onBlur={spotCreateOrderStore.setActiveInput}
              onFocus={() => spotCreateOrderStore.setActiveInput(ACTIVE_INPUT.Amount)}
            />
            {settingsStore.orderType === ORDER_TYPE.Limit && (
              <InputContainerWithMaxButton>
                <StyledMaxButton fitContent onClick={spotCreateOrderStore.onMaxClick}>
                  MAX
                </StyledMaxButton>
                <SizedBox height={14} />
                <TokenInput
                  amount={spotCreateOrderStore.inputTotal}
                  assetId={quoteToken.assetId}
                  decimals={quoteToken.decimals}
                  error={spotCreateOrderStore.isSell ? undefined : spotCreateOrderStore.isInputError}
                  errorMessage={`Not enough ${quoteToken.symbol}`}
                  setAmount={spotCreateOrderStore.setInputTotal}
                  onBlur={spotCreateOrderStore.setActiveInput}
                  onFocus={() => spotCreateOrderStore.setActiveInput(ACTIVE_INPUT.Total)}
                />
              </InputContainerWithMaxButton>
            )}
          </InputContainerWithError>
          <SmartFlex column>
            <SliderContainer>
              <Slider
                max={100}
                min={0}
                percent={spotCreateOrderStore.inputPercent.toNumber()}
                step={1}
                value={spotCreateOrderStore.inputPercent.toNumber()}
                onChange={(v) => handlePercentChange(v as number)}
              />
            </SliderContainer>
            <Row alignItems="center" justifyContent="space-between">
              <Text type={TEXT_TYPES.SUPPORTING}>Available</Text>
              <Row alignItems="center" mainAxisSize="fit-content">
                <Text type={TEXT_TYPES.BODY} primary>
                  {getAvailableAmount()}
                </Text>
                <Text type={TEXT_TYPES.SUPPORTING}>
                  &nbsp;{spotCreateOrderStore.isSell ? baseToken.symbol : quoteToken.symbol}
                </Text>
              </Row>
            </Row>
            {settingsStore.orderType === ORDER_TYPE.Market && (
              <Row alignItems="center" justifyContent="space-between" style={{ marginTop: 10 }}>
                <Text type={TEXT_TYPES.SUPPORTING}>Slippage</Text>
                <TokenInput
                  amount={spotCreateOrderStore.slippage}
                  decimals={0}
                  displayDecimals={2}
                  max={new BN(100)}
                  setAmount={handleSetSlippage}
                  styleInputContainer={{ width: 80, marginLeft: "auto" }}
                />
              </Row>
            )}
          </SmartFlex>
          {renderInstruction()}
          {renderOrderDetails()}
        </ParamsContainer>
        <ConnectWalletButton connectText="Connect wallet to trade" targetKey="create_order_connect_btn">
          {renderButton()}
        </ConnectWalletButton>

        <OrderTypeSheet isOpen={isOrderTooltipOpen} onClose={closeOrderTooltip} />
      </Root>
    </CreateOrderSkeletonWrapper>
  );
});

export default CreateOrder;

const Root = styled(SmartFlex)`
  padding: 12px;
  width: 100%;
  min-height: 418px;
  display: flex;
  gap: 16px;

  ${media.mobile} {
    min-height: fit-content;
  }
`;

const CreateOrderButton = styled(Button)`
  margin: auto 0 0;

  ${media.mobile} {
    margin: 0;
  }
`;

const ParamsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StyledRow = styled(SmartFlex)`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const SelectOrderTypeContainer = styled(SmartFlex)`
  display: flex;
  flex-direction: column;
  gap: 2px;

  width: 100%;
`;

const InputContainerWithMaxButton = styled(SelectOrderTypeContainer)`
  align-items: flex-end;
`;

const InputContainerWithError = styled(SmartFlex)`
  display: flex;
  gap: 8px;
  align-items: flex-start;

  padding-bottom: 9px;
`;

const StyledMaxButton = styled(MaxButton)`
  position: absolute;
  transform: translateY(-4px);
`;

const SliderContainer = styled.div`
  padding: 15px 0;

  ${media.mobile} {
    padding: 8px 0;
  }
`;
