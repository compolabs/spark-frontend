import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { SmartFlex } from "@components/SmartFlex.tsx";
import { Token } from "@src/entity";
import Text, { TEXT_TYPES } from "@components/Text.tsx";
import BN from "@src/utils/BN.ts";
import { DEFAULT_DECIMALS } from "@src/constants";
import { useStores } from "@stores";
import { themes } from "@src/themes/ThemeProvider.tsx";
import { useTheme } from "@emotion/react";

interface AssetBlock {
  token: {
    asset: Token;
    walletBalance: string;
    contractBalance: string;
    balance: string;
    assetId: string;
  };
}

const AssetBlock: React.FC<AssetBlock> = observer(({ token }) => {
  const { oracleStore } = useStores();
  const price = BN.formatUnits(oracleStore.getTokenIndexPrice(token.asset.priceFeed), token.asset.decimals);
  const theme = useTheme();
  if (token.asset.name === "USDC") {
    // console.log("asset", token);
    // console.log('price', price.toNumber())
    // console.log('balance', token.balance, BN.parseUnits(token.balance, 2))
    // console.log('1', price.multipliedBy(token.balance).toNumber())
  }
  // console.log('balanceData', balanceData)
  return (
      <TokenContainer center="y" gap="4px">
        <SmartFlex gap="10px">
          <TokenIcon src={token.asset.logo} />
        <div>
            <Text type={TEXT_TYPES.BUTTON} primary>{token.asset.symbol}</Text>
            <Text>{token.asset.name}</Text>
          </div>
        </SmartFlex>
        <div>
          <Text style={{textAlign: "right"}} type={TEXT_TYPES.BUTTON} primary>{new BN(token.balance).toSignificant(token.asset.decimals)}</Text>
          <Text color={theme.colors.greenLight} style={{textAlign: "right"}} type={TEXT_TYPES.SUPPORTING}>${price.multipliedBy(token.balance).toSignificant(2)}</Text>
        </div>
      </TokenContainer>
  );
});

export default AssetBlock;

const TokenIcon = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;

const TokenContainer = styled(SmartFlex)`
  width: 100%;
  background: #00000026;
  padding: 15px;
  border-radius: 8px;
  justify-content: space-between;
`;
