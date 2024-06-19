import React, { MouseEvent, useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";

import LeftCaretIcon from "@src/assets/icons/arrowUp.svg?react";
import { FuelNetwork } from "@src/blockchain";
import { useStores } from "@src/stores";
import { media } from "@src/themes/breakpoints";
import BN from "@src/utils/BN";

import Button, { ButtonGroup } from "../Button";
import { Dialog } from "../Dialog";
import MaxButton from "../MaxButton";
import Select from "../Select";
import { SmartFlex } from "../SmartFlex";
import Text, { TEXT_TYPES } from "../Text";
import TokenInput from "../TokenInput";

export interface IProps extends IDialogPropTypes {}

const tokens = [{ title: "USDC", key: "USDC" }];

const DepositWithdrawModal: React.FC<IProps> = observer(({ children, ...rest }) => {
  const { balanceStore, collateralStore } = useStores();
  const [isDeposit, setIsDeposit] = useState(true);

  const theme = useTheme();

  const [depositAmount, setDepositAmount] = useState(BN.ZERO);
  const [withdrawAmount, setWithdrawAmount] = useState(BN.ZERO);

  const bcNetwork = FuelNetwork.getInstance();
  const USDC = bcNetwork!.getTokenBySymbol("USDC");

  const USDCBalance = balanceStore.getBalance(USDC.assetId);
  const USDCBalanceFormatted = balanceStore.getFormatBalance(USDC.assetId, USDC.decimals);
  const collateralUSDCBalance = collateralStore.getBalance(USDC.assetId);
  const collateralUSDCBalanceFormatted = collateralStore.getFormatBalance(USDC.assetId, USDC.decimals);

  const shouldBeDisabled = isDeposit
    ? depositAmount.lte(BN.ZERO)
    : withdrawAmount.lte(BN.ZERO) || collateralUSDCBalance.lte(BN.ZERO);

  const handleMaxClick = () => {
    if (isDeposit) {
      setDepositAmount(USDCBalance);
      return;
    }

    setWithdrawAmount(collateralUSDCBalance);
  };

  const handleAmountChange = (v: BN) => {
    if (isDeposit) {
      setDepositAmount(v);
      return;
    }

    setWithdrawAmount(v);
  };

  const onSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    if (isDeposit) {
      collateralStore.deposit(USDC, depositAmount);
    } else {
      collateralStore.withdraw(USDC, withdrawAmount);
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
              {collateralUSDCBalanceFormatted}
            </Text>
            <Text type={TEXT_TYPES.SUPPORTING}>USDC</Text>
          </SmartFlex>
        </SmartFlex>
        <BorderBottomBox center="y" justifyContent="space-between">
          <Text type={TEXT_TYPES.BODY}>Net Account Balance (USD)</Text>
          <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
            ${collateralUSDCBalanceFormatted}
          </Text>
        </BorderBottomBox>
      </SmartFlex>
    );
  };

  const renderWithdrawContent = () => {
    const tokens = bcNetwork!.getTokenList();

    return (
      <SmartFlex gap="4px" width="100%" column>
        <SmartFlex margin="0 0 16px">
          <Text type={TEXT_TYPES.BUTTON_SECONDARY} primary>
            Asset balance
          </Text>
        </SmartFlex>
        <SmartFlex gap="9px" column>
          {tokens.map((token) => {
            const balance = collateralStore.getFormatBalance(token.assetId, token.decimals);
            return (
              <BorderBottomBox key={token.assetId} center="y" justifyContent="space-between">
                <SmartFlex center="y" gap="4px">
                  <TokenIcon alt={token.symbol} src={token.logo} />
                  <Text type={TEXT_TYPES.BODY} primary>
                    {token.symbol}
                  </Text>
                </SmartFlex>
                <Text type={TEXT_TYPES.BODY} primary>
                  {balance}
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
            <Select label="Asset" options={tokens} onSelect={() => {}} />
            <AmountContainer width="100%">
              <MaxButtonStyled fitContent onClick={handleMaxClick}>
                MAX
              </MaxButtonStyled>
              <TokenInput
                amount={isDeposit ? depositAmount : withdrawAmount}
                decimals={USDC.decimals}
                label="Amount"
                setAmount={handleAmountChange}
              />
            </AmountContainer>
          </SmartFlex>
          <BorderBottomBox center="y" justifyContent="space-between" width="100%">
            <Text type={TEXT_TYPES.SUPPORTING}>{isDeposit ? "Wallet balance" : "Available to withdraw"}</Text>
            <SmartFlex center="y" gap="4px">
              <Text color={theme.colors.textPrimary} type={TEXT_TYPES.SUPPORTING}>
                {isDeposit ? USDCBalanceFormatted : collateralUSDCBalanceFormatted}
              </Text>
              <Text type={TEXT_TYPES.SUPPORTING}>USDC</Text>
            </SmartFlex>
          </BorderBottomBox>
          {isDeposit ? renderDepositContent() : renderWithdrawContent()}
        </SmartFlex>
        <SmartFlex alignItems="flex-end">
          <Button disabled={shouldBeDisabled || collateralStore.isLoading} green onClick={onSubmit}>
            {collateralStore.isLoading ? "Loading..." : "Confirm"}
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
