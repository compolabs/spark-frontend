import React, { useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";

import TokenInput from "@components/TokenInput";

import { useStores } from "@stores";

import { CONFIG } from "@utils/getConfig";

import LeftCaretIcon from "@src/assets/icons/arrowUp.svg?react";
import { media } from "@src/themes/breakpoints";
import BN from "@src/utils/BN";

import Button, { ButtonGroup } from "./Button";
import { Dialog } from "./Dialog";
import MaxButton from "./MaxButton";
import Select from "./Select";
import { SmartFlex } from "./SmartFlex";
import Text, { TEXT_TYPES } from "./Text";

export interface IProps extends IDialogPropTypes {}

const AVAILABLE_TOKENS = CONFIG.TOKENS.filter((t) => t.collateral);
const AVAILABLE_TOKENS_SELECTOR = AVAILABLE_TOKENS.map((t) => ({ key: t.symbol, title: t.symbol, value: t }));

const DepositWithdrawModal: React.FC<IProps> = observer(({ ...rest }) => {
  const { balanceStore } = useStores();
  const theme = useTheme();

  const [isDeposit, setIsDeposit] = useState(true);

  const [depositAmount, setDepositAmount] = useState(BN.ZERO);
  const [withdrawAmount, setWithdrawAmount] = useState(BN.ZERO);

  const [selectedOptionToken, setSelectedOptionToken] = useState(AVAILABLE_TOKENS_SELECTOR[0]);

  const selectedTokenBalance = balanceStore.perpContractBalances.get(selectedOptionToken.value.assetId) ?? BN.ZERO;
  const selectedTokenWalletBalance = balanceStore.getWalletBalance(selectedOptionToken.value.assetId) ?? BN.ZERO;

  const selectedTokenWalletBalanceFormat = BN.formatUnits(
    selectedTokenWalletBalance,
    selectedOptionToken.value.decimals,
  );
  const selectedTokenBalanceFormat = BN.formatUnits(selectedTokenBalance, selectedOptionToken.value.decimals);

  const isIncorrectAmount = isDeposit
    ? depositAmount.gt(selectedTokenWalletBalance)
    : withdrawAmount.gt(selectedTokenBalance);

  const isZero = isDeposit ? depositAmount.isZero() : withdrawAmount.isZero();

  const shouldBeDisabled = isIncorrectAmount || isZero;

  console.log(withdrawAmount.toString(), selectedTokenBalance.toString());

  const handleMaxClick = () => {
    if (isDeposit) {
      setDepositAmount(selectedTokenWalletBalance);
      return;
    }

    setWithdrawAmount(selectedTokenBalance);
  };

  const handleAmountChange = (v: BN) => {
    if (isDeposit) {
      setDepositAmount(v);
      return;
    }

    setWithdrawAmount(v);
  };

  const handleTokenSelect = (v: any, index: number) => {
    const token = AVAILABLE_TOKENS_SELECTOR[index];
    setSelectedOptionToken(token);
  };

  const onSubmit = () => {
    if (isDeposit) {
      balanceStore.depositPerpBalance(selectedOptionToken.value.assetId, depositAmount);
    } else {
      balanceStore.withdrawPerpBalance(selectedOptionToken.value.assetId, withdrawAmount);
    }
  };

  const renderTitle = () => {
    return (
      <DialogTitleStyled center="y" gap="10px" margin="12px 12px 0" padding="8px 0">
        <LeftCaretIconStyled onClick={rest?.onClose} />
        <Text color="primary" type={TEXT_TYPES.H}>
          Deposit / Withdraw
        </Text>
      </DialogTitleStyled>
    );
  };

  const renderDepositContent = () => {
    return (
      <SmartFlex gap="4px" width="100%" column>
        <SmartFlex center="y" justifyContent="space-between">
          <Text type={TEXT_TYPES.BODY}>Asset Balance</Text>
          <SmartFlex center="y" gap="4px">
            <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
              {selectedTokenBalanceFormat.toSignificant(2)}
            </Text>
            <Text type={TEXT_TYPES.SUPPORTING}>{selectedOptionToken.value.symbol}</Text>
          </SmartFlex>
        </SmartFlex>
        <BorderBottomBox center="y" justifyContent="space-between">
          <Text type={TEXT_TYPES.BODY}>Net Account Balance (USD)</Text>
          <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
            ${BN.ZERO.toString()}
          </Text>
        </BorderBottomBox>
      </SmartFlex>
    );
  };

  const renderWithdrawContent = () => {
    return (
      <SmartFlex gap="4px" width="100%" column>
        <SmartFlex margin="0 0 16px">
          <Text type={TEXT_TYPES.BUTTON_SECONDARY} primary>
            Asset balance
          </Text>
        </SmartFlex>
        <SmartFlex gap="9px" column>
          {AVAILABLE_TOKENS.map((token) => {
            const balance = balanceStore.perpContractBalances.get(token.assetId) ?? BN.ZERO;
            const balanceFormat = BN.formatUnits(balance, token.decimals).toSignificant(2);
            return (
              <BorderBottomBox key={token.assetId} center="y" justifyContent="space-between">
                <SmartFlex center="y" gap="4px">
                  <TokenIcon alt={token.symbol} src={token.logo} />
                  <Text type={TEXT_TYPES.BODY} primary>
                    {token.symbol}
                  </Text>
                </SmartFlex>
                <Text type={TEXT_TYPES.BODY} primary>
                  {balanceFormat}
                </Text>
              </BorderBottomBox>
            );
          })}
        </SmartFlex>
      </SmartFlex>
    );
  };

  return (
    <DialogStyled {...rest} title={renderTitle()}>
      <DialogContainerStyled gap="16px" justifyContent="space-between" padding="16px 12px 24px" column>
        <SmartFlex gap="16px" width="100%" column>
          <ButtonGroup>
            <Button active={isDeposit} onClick={() => setIsDeposit(true)}>
              Deposit
            </Button>
            <Button active={!isDeposit} onClick={() => setIsDeposit(false)}>
              Withdraw
            </Button>
          </ButtonGroup>
          <SmartFlex center="y" gap="8px" width="100%">
            <Select label="Asset" options={AVAILABLE_TOKENS_SELECTOR} onSelect={handleTokenSelect} />
            <AmountContainer width="100%">
              <MaxButtonStyled fitContent onClick={handleMaxClick}>
                MAX
              </MaxButtonStyled>
              <TokenInput
                amount={isDeposit ? depositAmount : withdrawAmount}
                decimals={selectedOptionToken.value.decimals}
                label="Amount"
                setAmount={handleAmountChange}
              />
            </AmountContainer>
          </SmartFlex>
          <BorderBottomBox center="y" justifyContent="space-between" width="100%">
            <Text type={TEXT_TYPES.SUPPORTING}>{isDeposit ? "Wallet balance" : "Available to withdraw"}</Text>
            <SmartFlex center="y" gap="4px">
              <Text color={theme.colors.textPrimary} type={TEXT_TYPES.SUPPORTING}>
                {isDeposit
                  ? selectedTokenWalletBalanceFormat.toSignificant(2)
                  : selectedTokenBalanceFormat.toSignificant(2)}
              </Text>
              <Text type={TEXT_TYPES.SUPPORTING}>{selectedOptionToken.value.symbol}</Text>
            </SmartFlex>
          </BorderBottomBox>
          {isDeposit ? renderDepositContent() : renderWithdrawContent()}
        </SmartFlex>
        <SmartFlex alignItems="flex-end">
          {/* TODO: Handle loading logic */}
          {/* <Button disabled={shouldBeDisabled || collateralStore.isLoading} green onClick={onSubmit}>
            {collateralStore.isLoading ? "Loading..." : "Confirm"}
          </Button> */}
          <Button disabled={shouldBeDisabled} green onClick={onSubmit}>
            Confirm
          </Button>
        </SmartFlex>
      </DialogContainerStyled>
    </DialogStyled>
  );
});

export default DepositWithdrawModal;

const LeftCaretIconStyled = styled(LeftCaretIcon)`
  transform: rotate(90deg);
  cursor: pointer;
`;

const AmountContainer = styled(SmartFlex)`
  position: relative;
`;

const MaxButtonStyled = styled(MaxButton)`
  position: absolute;
  right: 0;
  top: -4px;

  z-index: 1;
`;

const TokenIcon = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 50%;
`;

const DialogStyled = styled(Dialog)`
  ${media.mobile} {
    height: 100%;
    padding: 24px 0;
  }
`;

const DialogTitleStyled = styled(SmartFlex)`
  ${media.mobile} {
    margin-top: 0;
  }
`;

const DialogContainerStyled = styled(SmartFlex)`
  ${media.mobile} {
    height: 100%;
    padding-bottom: 30px;
  }
`;

const BorderBottomBox = styled(SmartFlex)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSecondary};
  padding-bottom: 5px;
`;