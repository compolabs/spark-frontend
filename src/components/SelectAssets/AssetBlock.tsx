import React, { CSSProperties } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import { DEFAULT_DECIMALS } from "@src/constants";
import { Token } from "@src/entity";
import BN from "@src/utils/BN";
import { useStores } from "@stores";

export interface IAssetBlock {
  options: {
    showBalance?: "balance" | "walletBalance" | "contractBalance";
    showNullBalance?: boolean;
    isShowBalance?: boolean;
  };
  token: {
    asset: Token;
    walletBalance: string;
    contractBalance: string;
    balance: string;
    assetId: string;
  };
  styleToken?: CSSProperties;
}

const AssetBlock: React.FC<IAssetBlock> = observer(
  ({ styleToken, options: { showBalance = "balance", showNullBalance = true, isShowBalance = true }, token }) => {
    const { oracleStore } = useStores();
    const price = BN.formatUnits(oracleStore.getTokenIndexPrice(token.asset.priceFeed), DEFAULT_DECIMALS);
    const theme = useTheme();
    if (!showNullBalance && new BN(token[showBalance]).isLessThanOrEqualTo(BN.ZERO)) return <></>;
    return (
      <TokenContainer center="y" gap="4px" style={styleToken}>
        <SmartFlex gap="10px">
          <TokenIcon src={token.asset.logo} />
          <div>
            <Text type={TEXT_TYPES.BUTTON} primary>
              {token.asset.symbol}
            </Text>
            <Text>{token.asset.name}</Text>
          </div>
        </SmartFlex>
        {isShowBalance && (
          <div>
            <Text style={{ textAlign: "right" }} type={TEXT_TYPES.BUTTON} primary>
              {new BN(token[showBalance]).toSignificant(token.asset.decimals)}
            </Text>
            <Text color={theme.colors.greenLight} style={{ textAlign: "right" }} type={TEXT_TYPES.SUPPORTING}>
              ${price.multipliedBy(token[showBalance]).toSignificant(2)}
            </Text>
          </div>
        )}
      </TokenContainer>
    );
  },
);

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
