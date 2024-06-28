import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import WalletIcon from "@src/assets/icons/wallet.svg?react";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@src/components/Text";

interface BalanceSectionProps {
  isLoaded: boolean | null;
  balance: string;
  balanceUSD: number;
}

export const BalanceSection = observer(({ isLoaded, balance, balanceUSD }: BalanceSectionProps) => {
  const theme = useTheme();

  return (
    <Root>
      <Text type={TEXT_TYPES.BODY}>${balanceUSD.toFixed(4)}</Text>
      {isLoaded ? (
        <Balance>
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
`;
