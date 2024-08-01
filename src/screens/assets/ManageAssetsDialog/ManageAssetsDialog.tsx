import React from "react";
import { useTheme } from "@emotion/react";
import { observer } from "mobx-react";

import Button from "@components/Button.tsx";
import { Column, Row } from "@components/Flex.tsx";
import SideBar from "@components/SideBar.tsx";
import Text, { TEXT_TYPES } from "@components/Text.tsx";
import depositAssets from "@src/assets/icons/depositAssets.svg";
import { FuelNetwork } from "@src/blockchain";
import BN from "@src/utils/BN.ts";
import { useStores } from "@stores";

import AssetBlock from "./AssetBlock";
import styled from "@emotion/styled";

const ManageAssetsDialog = observer(() => {
  const { quickAssetsStore, balanceStore } = useStores();
  const theme = useTheme();
  // const vm = useSpotTableVMProvider();
  const bcNetwork = FuelNetwork.getInstance();

  const balanceData = Array.from(balanceStore.balances)
    .filter(([, balance]) => balance && balance.gt(0))
    .map(([assetId, balance]) => {
      const token = bcNetwork!.getTokenByAssetId(assetId);
      const contractBalance =
        token.symbol === "USDC" ? balanceStore.myMarketBalance.liquid.quote : balanceStore.myMarketBalance.liquid.base;
      const totalBalance = token.symbol === "ETH" ? balance : contractBalance.plus(balance);

      return {
        asset: token,
        walletBalance: BN.formatUnits(balance, token.decimals).toString(),
        contractBalance: BN.formatUnits(contractBalance, token.decimals).toString(),
        balance: BN.formatUnits(totalBalance, token.decimals).toString(),
        assetId,
      };
    });

  const accumulateBalance = balanceData.reduce((acc, account) => acc + parseFloat(account.balance), 0);

  return (
    <SideBar isShow={quickAssetsStore.openQuickAssets}>
      <div>
        <TextTitle type={TEXT_TYPES.BUTTON} primary>
          Deposited Assets
        </TextTitle>
      </div>
      <DepositedAssets alignItems="center" gap="20px">
        <img alt="icon deposit" height={58} src={depositAssets} width={54} />
        <Column>
          <Text>No deposited assets.</Text>
          <Text color={theme.colors.greenLight}>Start trading.</Text>
        </Column>
      </DepositedAssets>
      <Row alignItems="center" gap="10px" justifyContent="center">
        <Button>Deposit</Button>
        <Button>Withdraw</Button>
      </Row>
      <TextTitle style={{ margin: "30px 0px 10px 0px", padding: 16 }} type={TEXT_TYPES.BUTTON} primary>
        Wallet holdings
      </TextTitle>
      <Column gap="10px" style={{ width: "100%" }}>
        {balanceData.map((el) => (
          <AssetBlock key={el.assetId} token={el} />
        ))}
      </Column>
      <Row justifyContent="space-between" style={{ padding: 16 }}>
        <Text type={TEXT_TYPES.BUTTON} primary>Overall</Text>
        <Text color={theme.colors.greenLight} style={{ textAlign: "right" }} type={TEXT_TYPES.SUPPORTING}>
          ${new BN(accumulateBalance).toSignificant(2)}
        </Text>
      </Row>
    </SideBar>
  );
});

export default ManageAssetsDialog;


const DepositedAssets = styled(Row)`
  margin: 10px 0px 10px 0px;
`;

const TextTitle = styled(Text)`
  font-family: Space Grotesk,serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: 0.02em;
  text-align: left;
`;
