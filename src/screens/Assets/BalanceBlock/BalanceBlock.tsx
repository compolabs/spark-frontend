import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import { AssetBlockData } from "@components/SelectAssets/SelectAssetsInput.tsx";
import { SmartFlex } from "@components/SmartFlex.tsx";
import Text, { TEXT_TYPES } from "@components/Text.tsx";
import { DEFAULT_DECIMALS } from "@src/constants";
import BN from "@src/utils/BN.ts";
import { useStores } from "@stores";

interface IBalanceBlock {
  icon: React.ReactElement;
  nameWallet: string;
  token: AssetBlockData;
  showBalance: "balance" | "walletBalance" | "contractBalance";
}

export const BalanceBlock: React.FC<IBalanceBlock> = ({ icon, nameWallet, token, showBalance }) => {
  const { oracleStore } = useStores();
  const theme = useTheme();
  const price = BN.formatUnits(oracleStore.getTokenIndexPrice(token.asset.priceFeed), DEFAULT_DECIMALS);

  return (
    <SmartFlexBalance>
      <SmartFlex alignItems="center" gap="10px">
        {icon}
        <Text type={TEXT_TYPES.BUTTON}>{nameWallet}</Text>
      </SmartFlex>
      <SmartFlex column>
        <Text style={{ textAlign: "right" }} type={TEXT_TYPES.INFO} primary>
          {new BN(token[showBalance]).toSignificant(token.asset.decimals)}
        </Text>
        <Text color={theme.colors.greenLight} style={{ textAlign: "right" }} type={TEXT_TYPES.BODY}>
          ${price.multipliedBy(token[showBalance]).toSignificant(2)}
        </Text>
      </SmartFlex>
    </SmartFlexBalance>
  );
};

const SmartFlexBalance = styled(SmartFlex)`
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: ${({ theme }) => theme.colors.borderSecondary};
  border-radius: 8px;
`;