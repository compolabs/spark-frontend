import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button";
import { Column } from "@components/Flex";
import AssetBlock from "@components/SelectAssets/AssetBlock";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import { InfoBlockAssets } from "@screens/Assets/MainAssets/InfoBlockAssets";
import DepositAssets from "@src/assets/icons/depositAssets.svg?react";
import { FuelNetwork } from "@src/blockchain";
import { DEFAULT_DECIMALS } from "@src/constants";
import BN from "@src/utils/BN";
import { useStores } from "@stores";

interface MainAssets {
  setStep: (value: number) => void;
}

const MainAssets = observer(({ setStep }: MainAssets) => {
  const { quickAssetsStore, balanceStore } = useStores();
  const { oracleStore, settingsStore } = useStores();
  const bcNetwork = FuelNetwork.getInstance();
  const isShowDepositInfo = settingsStore?.isShowDepositInfo ?? true;

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

  const hasPositiveBalance = balanceData.some((item) => new BN(item.walletBalance).isGreaterThan(BN.ZERO));

  const accumulateBalance = balanceData.reduce((acc, account) => {
    const price = BN.formatUnits(oracleStore.getTokenIndexPrice(account.asset.priceFeed), DEFAULT_DECIMALS);
    return acc.plus(new BN(account.balance).multipliedBy(price));
  }, BN.ZERO);

  const closeAssets = () => {
    quickAssetsStore.setCurrentStep(0);
    quickAssetsStore.setQuickAssets(false);
  };

  return (
    <AssetsContainer justifyContent="space-between" column>
      <SmartFlex alignItems="center" justifyContent="space-between">
        <TextTitle type={TEXT_TYPES.TITLE_MODAL} primary>
          Deposited Assets
        </TextTitle>
      </SmartFlex>

      <DepositedAssets alignItems="center" gap="20px" justifyContent="center" column>
        <DepositAssets />
        <TextTitleDeposit>Deposit assets to trade fast and cheap.</TextTitleDeposit>
      </DepositedAssets>

      <SmartFlex gap="10px" style={{ width: "100%" }} column>
        {balanceData.map((el) => (
          <AssetBlock key={el.assetId} options={{ showBalance: "walletBalance" }} token={el} />
        ))}
      </SmartFlex>
      <ButtomClolumn justifyContent="space-between">
        {isShowDepositInfo && <InfoBlockAssets />}
        <Button green onClick={() => setStep(1)}>
          Deposit
        </Button>
      </ButtomClolumn>
    </AssetsContainer>
  );
});

export default MainAssets;

const ButtomClolumn = styled(Column)`
  width: 100%;
`;
const TextTitle = styled(Text)`
  width: 182px;
  line-height: 20px;
  letter-spacing: 0.32px;
`;

const TextTitleDeposit = styled(TextTitle)`
  text-align: center;
  font-size: 14px;
  width: 184px;
`;

const AssetsContainer = styled(SmartFlex)`
  height: 100%;
`;

const DepositedAssets = styled(SmartFlex)`
  height: 100%;
  width: 100%;
`;
