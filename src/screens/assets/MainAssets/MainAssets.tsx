import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button.tsx";
import { Column, Row } from "@components/Flex.tsx";
import AssetBlock from "@components/SelectAssets/AssetBlock.tsx";
import { SmartFlex } from "@components/SmartFlex.tsx";
import Text, { TEXT_TYPES } from "@components/Text.tsx";
// import closeThin from "@src/assets/icons/closeThin.svg"; // TODO: Ждем иконку
// import depositAssets from "@src/assets/icons/depositAssets.svg"; // TODO: Ждем иконку
import { FuelNetwork } from "@src/blockchain";
import { ROUTES } from "@src/constants";
import BN from "@src/utils/BN.ts";
import { useStores } from "@stores";

interface MainAssets {
  setStep: (value: number) => void;
}

const MainAssets = observer(({ setStep }: MainAssets) => {
  const { quickAssetsStore, balanceStore } = useStores();
  const theme = useTheme();
  const navigate = useNavigate();
  const { oracleStore } = useStores();
  const bcNetwork = FuelNetwork.getInstance();

  const balanceData = Array.from(balanceStore.balances)
    .filter(([, balance]) => balance && balance.gt(BN.ZERO))
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

  const hasPositiveBalance = balanceData.some((item) => parseFloat(item.walletBalance) > 0);

  const accumulateBalance = balanceData.reduce((acc, account) => {
    const price = BN.formatUnits(oracleStore.getTokenIndexPrice(account.asset.priceFeed), 9);
    return acc.plus(new BN(account.balance).multipliedBy(price));
  }, new BN(BN.ZERO));

  const closeAssets = () => {
    quickAssetsStore.setQuickAssets(false);
  };

  const startTrading = () => {
    closeAssets();
    navigate(ROUTES.TRADE);
  };

  return (
    <>
      <SmartFlex alignItems="center" justifyContent="space-between">
        <TextTitle type={TEXT_TYPES.BUTTON} primary>
          Deposited Assets
        </TextTitle>
        {/* <CloseButton alt="icon close" src={closeThin} onClick={closeAssets} /> */}
      </SmartFlex>
      {hasPositiveBalance ? (
        <DepositedAssets>
          <SmartFlex gap="10px" width="100%" column>
            {balanceData.map((el) => (
              <AssetBlock
                key={el.assetId}
                options={{ showBalance: "contractBalance", showNullBalance: false }}
                token={el}
              />
            ))}
          </SmartFlex>
        </DepositedAssets>
      ) : (
        <DepositedAssets alignItems="center" gap="20px" justifyContent="center">
          {/* <img alt="icon deposit" height={58} src={depositAssets} width={54} /> */}
          <Column>
            <Text>No deposited assets.</Text>
            <Button text onClick={startTrading}>
              <Text color={theme.colors.greenLight}>Start trading.</Text>
            </Button>
          </Column>
        </DepositedAssets>
      )}
      <SmartFlex alignItems="center" gap="10px" justifyContent="center">
        <Button onClick={() => setStep(1)}>Deposit</Button>
        <Button grey onClick={() => setStep(2)}>
          Withdraw
        </Button>
      </SmartFlex>
      <TextTitle style={{ margin: "30px 0px 10px 0px", padding: 16 }} type={TEXT_TYPES.BUTTON} primary>
        Wallet holdings
      </TextTitle>
      <SmartFlex gap="10px" style={{ width: "100%" }} column>
        {balanceData.map((el) => (
          <AssetBlock key={el.assetId} options={{ showBalance: "walletBalance" }} token={el} />
        ))}
      </SmartFlex>
      <Row justifyContent="space-between" style={{ padding: 16 }}>
        <Text type={TEXT_TYPES.BUTTON} primary>
          Overall
        </Text>
        <Text color={theme.colors.greenLight} style={{ textAlign: "right" }} type={TEXT_TYPES.SUPPORTING}>
          ${new BN(accumulateBalance).toSignificant(2)}
        </Text>
      </Row>
    </>
  );
});

export default MainAssets;

const DepositedAssets = styled(SmartFlex)`
  margin: 20px 0px 20px 0px;
  width: 100%;
`;

const CloseButton = styled.img`
  width: 30px;
  height: 30px;
  background: #7676803d;
  padding: 8px;
  border-radius: 100px;
  &:hover {
    cursor: pointer;
  }
`;

const TextTitle = styled(Text)`
  font-family:
    Space Grotesk,
    serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: 0.02em;
  text-align: left;
`;
