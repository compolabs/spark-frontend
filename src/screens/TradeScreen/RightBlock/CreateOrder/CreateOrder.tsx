import React, { useState } from "react";
import styled from "@emotion/styled";
import { Accordion } from "@szhsin/react-accordion";
import { observer } from "mobx-react";

import AccordionItem from "@components/AccordionItem";
import { Column, Row } from "@components/Flex";
import MaxButton from "@components/MaxButton";
import Select from "@components/Select";
import Slider from "@components/Slider";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import TokenInput from "@components/TokenInput";
import Button, { ButtonGroup } from "@src/components/Button";
import { Checkbox } from "@src/components/Checkbox";
import SizedBox from "@src/components/SizedBox";
import { SmartFlex } from "@src/components/SmartFlex";
import { DEFAULT_DECIMALS } from "@src/constants";
import useFlag from "@src/hooks/useFlag";
import { useMedia } from "@src/hooks/useMedia";
import {
  ACTIVE_INPUT,
  ORDER_MODE,
  ORDER_TYPE,
  useCreateOrderVM,
} from "@src/screens/TradeScreen/RightBlock/CreateOrder/CreateOrderVM";
import { media } from "@src/themes/breakpoints";
import BN from "@src/utils/BN";
import { useStores } from "@stores";

import { OrderTypeSheet, OrderTypeTooltip, OrderTypeTooltipIcon } from "./OrderTypeTooltip";

const ORDER_OPTIONS = [
  { title: "Market", key: ORDER_TYPE.Market, disabled: true },
  { title: "Limit", key: ORDER_TYPE.Limit },
  // { title: "Stop Market", key: ORDER_TYPE.StopMarket, disabled: true },
  // { title: "Stop Limit", key: ORDER_TYPE.StopLimit, disabled: true },
  // { title: "Take Profit", key: ORDER_TYPE.TakeProfit, disabled: true },
  // { title: "Take Profit Limit", key: ORDER_TYPE.TakeProfitLimit, disabled: true },
];

const LEVERAGE_OPTIONS = [5, 10, 20];

const IS_TP_SL_FEATURE_DISABLED = true;

const MINIMAL_ETH_REQUIRED = 25000; // 0.000025

const CreateOrder: React.FC = observer(() => {
  const { balanceStore, tradeStore, settingsStore, collateralStore } = useStores();
  const vm = useCreateOrderVM();
  const market = tradeStore.market;
  const isPerp = tradeStore.isPerp;

  const media = useMedia();

  const isButtonDisabled = vm.isLoading || !vm.canProceed;

  const [isOrderTooltipOpen, openOrderTooltip, closeOrderTooltip] = useFlag();

  const [isTpSlActive, setIsTpSlActive] = useState(false);

  if (!market) return null;

  const { baseToken, quoteToken } = market;

  const handlePercentChange = (v: number) => {
    const balance = balanceStore.getBalance(vm.isSell ? baseToken.assetId : quoteToken.assetId);

    if (balance.eq(BN.ZERO)) return;

    const value = BN.percentOf(balance, v);
    if (vm.isSell) {
      vm.setInputAmount(value);
      return;
    }

    vm.setInputTotal(value);
  };

  const handleSetOrderType = (type: ORDER_TYPE) => {
    settingsStore.setOrderType(type);
  };

  const handleSetPrice = (amount: BN) => {
    if (settingsStore.orderType === ORDER_TYPE.Market) return;

    vm.setInputPrice(amount);
  };

  const toggleTpSl = () => {
    setIsTpSlActive((state) => !state);
  };

  const isInputPriceDisabled = settingsStore.orderType !== ORDER_TYPE.Limit;

  const renderButton = () => {
    const isEnoughGas = balanceStore.getNativeBalance().gt(MINIMAL_ETH_REQUIRED);

    if (!isButtonDisabled && !isEnoughGas) {
      return (
        <CreateOrderButton disabled>
          <Text type={TEXT_TYPES.BUTTON}>Insufficient ETH for gas</Text>
        </CreateOrderButton>
      );
    }

    return (
      <CreateOrderButton disabled={isButtonDisabled} green={!vm.isSell} red={vm.isSell} onClick={vm.createOrder}>
        <Text primary={!isButtonDisabled} type={TEXT_TYPES.BUTTON}>
          {vm.isLoading ? "Loading..." : vm.isSell ? `Sell ${baseToken.symbol}` : `Buy ${baseToken.symbol}`}
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
                <Text primary>{BN.formatUnits(vm.inputAmount, baseToken.decimals).toSignificant(4)}</Text>
                <Text>&nbsp;{baseToken.symbol}</Text>
              </Row>
            </Row>
          }
          defaultChecked
          initialEntered
        >
          <Row alignItems="center" justifyContent="space-between">
            <Text nowrap>Max {vm.isSell ? "sell" : "buy"}</Text>
            <Row alignItems="center" justifyContent="flex-end">
              <Text primary>{BN.formatUnits(vm.inputTotal, quoteToken.decimals).toFormat(2)}</Text>
              <Text>&nbsp;{quoteToken.symbol}</Text>
            </Row>
          </Row>
          <Row alignItems="center" justifyContent="space-between">
            <Text nowrap>Matcher Fee</Text>
            <Row alignItems="center" justifyContent="flex-end">
              <Text primary>0.000001</Text>
              <Text>&nbsp;ETH</Text>
            </Row>
          </Row>
          <Row alignItems="center" justifyContent="space-between">
            <Text nowrap>Total amount</Text>
            <Row alignItems="center" justifyContent="flex-end">
              <Text primary>{BN.formatUnits(vm.inputAmount, baseToken.decimals).toSignificant(4)}</Text>
              <Text>&nbsp;{baseToken.symbol}</Text>
            </Row>
          </Row>
        </AccordionItem>
      </Accordion>
    );
  };

  // const renderLeverageContent = () => (
  //   <Accordion transitionTimeout={400} transition>
  //     <AccordionItem
  //       header={
  //         <Row alignItems="center" justifyContent="space-between" mainAxisSize="stretch">
  //           <Text type={TEXT_TYPES.BUTTON_SECONDARY} primary>
  //             LEVERAGE
  //           </Text>
  //           <Row alignItems="center" justifyContent="flex-end">
  //             <Text primary>{vm.inputLeveragePercent.toSignificant(2)}</Text>
  //             <Text>&nbsp;%</Text>
  //           </Row>
  //         </Row>
  //       }
  //       hideBottomBorder
  //     >
  //       <SmartFlex gap="8px" column>
  //         <Slider
  //           max={100}
  //           min={0}
  //           percent={vm.inputLeverage.toNumber()}
  //           symbol="x"
  //           value={vm.inputLeveragePercent.toNumber()}
  //           onChange={(v) => vm.setInputLeveragePercent(v as number)}
  //         />
  //         <SmartFlex gap="8px">
  //           <TokenInput amount={vm.inputLeverage} decimals={0} setAmount={vm.setInputLeverage} />
  //           {LEVERAGE_OPTIONS.map((option) => (
  //             <LeverageButton key={option} onClick={() => vm.setInputLeverage(new BN(option))}>
  //               {option}x
  //             </LeverageButton>
  //           ))}
  //         </SmartFlex>
  //       </SmartFlex>
  //     </AccordionItem>
  //   </Accordion>
  // );

  const renderTpSlContent = () => {
    if (!isPerp || IS_TP_SL_FEATURE_DISABLED) return;

    return (
      <SmartFlex alignItems="flex-start" gap="8px" margin="8px 0" column>
        <Checkbox checked={isTpSlActive} onChange={toggleTpSl}>
          <Text type={TEXT_TYPES.BUTTON_SECONDARY} primary>
            TP / SL
          </Text>
        </Checkbox>
        <TpSlContentContainer gap="8px" isOpen={isTpSlActive}>
          <TokenInput
            amount={vm.inputAmount}
            assetId={quoteToken.assetId}
            decimals={quoteToken.decimals}
            label="Take profit"
          />
          <TokenInput
            amount={vm.inputAmount}
            assetId={quoteToken.assetId}
            decimals={quoteToken.decimals}
            label="Stop loss"
          />
        </TpSlContentContainer>
      </SmartFlex>
    );
  };

  const getAvailableAmount = () => {
    if (isPerp) {
      return collateralStore.getFormatBalance(
        vm.isSell ? baseToken.assetId : quoteToken.assetId,
        vm.isSell ? baseToken.decimals : quoteToken.decimals,
      );
    }

    return balanceStore.getFormatBalance(
      vm.isSell ? baseToken.assetId : quoteToken.assetId,
      vm.isSell ? baseToken.decimals : quoteToken.decimals,
    );
  };

  return (
    <Root column>
      <ButtonGroup>
        <Button active={!vm.isSell} onClick={() => vm.setOrderMode(ORDER_MODE.BUY)}>
          <Text primary={!vm.isSell} type={TEXT_TYPES.BUTTON_SECONDARY}>
            buy
          </Text>
        </Button>
        <Button active={vm.isSell} onClick={() => vm.setOrderMode(ORDER_MODE.SELL)}>
          <Text primary={vm.isSell} type={TEXT_TYPES.BUTTON_SECONDARY}>
            sell
          </Text>
        </Button>
      </ButtonGroup>
      <ParamsContainer>
        <StyledRow>
          <StyledColumn crossAxisSize="max">
            <Select
              label="Order type"
              options={ORDER_OPTIONS}
              selected={settingsStore.orderType}
              onSelect={({ key }) => handleSetOrderType(key)}
            />
            {renderOrderTooltip()}
          </StyledColumn>
          <TokenInput
            amount={vm.inputPrice}
            decimals={DEFAULT_DECIMALS}
            disabled={isInputPriceDisabled}
            label="Price"
            setAmount={handleSetPrice}
            onBlur={vm.setActiveInput}
            onFocus={() => vm.setActiveInput(ACTIVE_INPUT.Price)}
          />
        </StyledRow>
        <StyledRow alignItems="flex-end">
          <TokenInput
            amount={vm.inputAmount}
            assetId={baseToken.assetId}
            decimals={baseToken.decimals}
            error={vm.isSell ? vm.isInputError : undefined}
            label="Order size"
            setAmount={vm.setInputAmount}
            onBlur={vm.setActiveInput}
            onFocus={() => vm.setActiveInput(ACTIVE_INPUT.Amount)}
          />
          <StyledColumn alignItems="flex-end" crossAxisSize="max">
            <StyledMaxButton fitContent onClick={vm.onMaxClick}>
              MAX
            </StyledMaxButton>
            <SizedBox height={14} />
            <TokenInput
              amount={vm.inputTotal}
              assetId={quoteToken.assetId}
              decimals={quoteToken.decimals}
              error={vm.isSell ? undefined : vm.isInputError}
              setAmount={vm.setInputTotal}
              onBlur={vm.setActiveInput}
              onFocus={() => vm.setActiveInput(ACTIVE_INPUT.Total)}
            />
          </StyledColumn>
        </StyledRow>
        <Row alignItems="center" justifyContent="space-between">
          <Text type={TEXT_TYPES.SUPPORTING}>Available</Text>
          <Row alignItems="center" mainAxisSize="fit-content">
            <Text type={TEXT_TYPES.BODY} primary>
              {getAvailableAmount()}
            </Text>
            <Text type={TEXT_TYPES.SUPPORTING}>&nbsp;{vm.isSell ? baseToken.symbol : quoteToken.symbol}</Text>
          </Row>
        </Row>
        {!isPerp && (
          <SliderContainer>
            <Slider
              max={100}
              min={0}
              percent={vm.inputPercent.toNumber()}
              step={1}
              value={vm.inputPercent.toNumber()}
              onChange={(v) => handlePercentChange(v as number)}
            />
          </SliderContainer>
        )}
        {/* {isPerp ? renderLeverageContent() : null} */}
        {renderTpSlContent()}
        {renderOrderDetails()}
      </ParamsContainer>
      {renderButton()}

      <OrderTypeSheet isOpen={isOrderTooltipOpen} onClose={closeOrderTooltip} />
    </Root>
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

const LeverageButton = styled(Button)`
  width: 34px;
  height: 32px;
  border-radius: 4px;

  background-color: ${({ theme }) => theme.colors.bgPrimary};
  border: 1px solid ${({ theme }) => theme.colors.borderSecondary};
  ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}
`;

const TpSlContentContainer = styled(SmartFlex)<{ isOpen: boolean }>`
  max-height: ${({ isOpen }) => (isOpen ? "50px" : "0")};
  transition: max-height 0.25s cubic-bezier(0, 0, 0, 1);
  overflow: hidden;
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

const StyledRow = styled(Row)`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const StyledColumn = styled(Column)`
  display: flex;
  flex-direction: column;
  gap: 2px;
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
