import React, { CSSProperties } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";

import { useStores } from "@stores";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";

import { AssetBlockData } from "./SelectAssetsInput";

export interface IAssetBlock {
  options: {
    showBalance?: "balance" | "walletBalance" | "contractBalance";
    showNullBalance?: boolean;
    isShowBalance?: boolean;
  };
  token: AssetBlockData;
  styleToken?: CSSProperties;
  type?: "rounded" | "square";
}

const AssetBlock: React.FC<IAssetBlock> = observer(
  ({
    styleToken,
    options: { showBalance = "balance", showNullBalance = true, isShowBalance = true },
    token,
    type = "square",
  }) => {
    const { oracleStore } = useStores();
    const price = BN.formatUnits(oracleStore.getTokenIndexPrice(token.asset.priceFeed), DEFAULT_DECIMALS);
    const theme = useTheme();

    if (!showNullBalance && new BN(token[showBalance]).isLessThanOrEqualTo(BN.ZERO)) return null;

    return (
      <TokenContainer center="y" gap="4px" style={styleToken}>
        <SmartFlex alignItems="center" gap="10px">
          <TokenIcon src={token.asset.logo} />
          <div>
            <Text type={type === "rounded" ? TEXT_TYPES.H : TEXT_TYPES.BUTTON} primary>
              {token.asset.symbol}
            </Text>
            {isShowBalance && <Text type={TEXT_TYPES.BODY}>{token.asset.name}</Text>}
          </div>
        </SmartFlex>
        {isShowBalance && (
          <div>
            <Text style={{ textAlign: "right" }} type={TEXT_TYPES.TEXT} primary>
              {new BN(token[showBalance]).toSignificant(token.asset.decimals)}
            </Text>
            <Text color={theme.colors.greenLight} style={{ textAlign: "right" }} type={TEXT_TYPES.BODY}>
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
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

const TokenContainer = styled(SmartFlex)`
  width: 100%;
  border-radius: 8px;
  justify-content: space-between;
`;
