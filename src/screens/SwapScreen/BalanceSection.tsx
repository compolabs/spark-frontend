import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Text, { TEXT_TYPES } from "@components/Text";

import WalletIcon from "@assets/icons/wallet.svg?react";

interface BalanceSectionProps {
  isLoaded: boolean | null;
  balance: string;
  balanceUSD: number;
  handleMaxAmount: () => void;
}

export const BalanceSection = observer(({ isLoaded, balance, balanceUSD, handleMaxAmount }: BalanceSectionProps) => {
  const theme = useTheme();

  return (
    <Root>
      <Text type={TEXT_TYPES.BODY}>${balanceUSD.toFixed(2)}</Text>
      {isLoaded ? (
        <Balance onClick={handleMaxAmount}>
          <Text color={theme.colors.greenLight} type={TEXT_TYPES.BODY}>
            {balance}
          </Text>
          <WalletIcon />
        </Balance>
      ) : null}
    </Root>
  );
});

const Root = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Balance = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
`;
