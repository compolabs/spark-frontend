import React from "react";
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
import arrowLeftShort from "@src/assets/icons/arrowLeftShort.svg";
import closeThin from "@src/assets/icons/closeThin.svg";

interface MainAssets {
  setStep: (value: number) => void;
}

const MainAssets = observer(({ setStep }: MainAssets) => {
  const { balanceStore } = useStores();
  const { oracleStore, settingsStore, quickAssetsStore } = useStores();
  const theme = useTheme();
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

  const hasPositiveBalance = balanceData.some((item) => new BN(item.contractBalance).isGreaterThan(BN.ZERO));

  const accumulateBalanceContract = balanceData.reduce((acc, account) => {
    const price = BN.formatUnits(oracleStore.getTokenIndexPrice(account.asset.priceFeed), DEFAULT_DECIMALS);
    return acc.plus(new BN(account.contractBalance).multipliedBy(price));
  }, BN.ZERO);

  const closeAssets = () => {
    quickAssetsStore.setCurrentStep(0);
    quickAssetsStore.setQuickAssets(false);
  };

  return (
    <AssetsContainer justifyContent="space-between" column>
      <SmartFlex alignItems="center" justifyContent="space-between" column>
        <HeaderBlock alignItems="center" gap="10px" justifyContent="space-between">
          <TextTitle type={TEXT_TYPES.TITLE_MODAL} primary>
            Deposited Assets
          </TextTitle>
          <CloseButton alt="icon close" src={closeThin} onClick={closeAssets} />
        </HeaderBlock>
        {hasPositiveBalance && (
          <WalletBlock gap="8px" column>
            {balanceData.map((el) => (
              <AssetItem key={el.assetId}>
                <AssetBlock options={{ showBalance: "contractBalance" }} token={el} />
              </AssetItem>
            ))}
            <OverallBlock justifyContent="space-between">
              <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON}>
                Overall
              </Text>
              <Text color={theme.colors.greenLight}>${new BN(accumulateBalanceContract).toSignificant(2)}</Text>
            </OverallBlock>
          </WalletBlock>
        )}
      </SmartFlex>
      {!hasPositiveBalance && (
        <DepositedAssets alignItems="center" gap="20px" justifyContent="center" column>
          <DepositAssets />
          <TextTitleDeposit>Deposit assets to trade fast and cheap.</TextTitleDeposit>
        </DepositedAssets>
      )}
      <ButtomClolumn justifyContent="space-between">
        {isShowDepositInfo && <InfoBlockAssets />}
        <Button green onClick={() => setStep(1)}>
          Deposit
        </Button>
        <Button black onClick={() => setStep(2)}>
          Withdraw
        </Button>
      </ButtomClolumn>
    </AssetsContainer>
  );
});

export default MainAssets;

const HeaderBlock = styled(SmartFlex)`
  width: 100%;
`;
const OverallBlock = styled(SmartFlex)`
  margin: 0px 15px;
`;
const AssetItem = styled(SmartFlex)`
  padding: 12px;
  background: #00000026;
  border-radius: 8px;
`;

const WalletBlock = styled(SmartFlex)`
  width: 100%;
  margin-top: 40px;
`;
const ButtomClolumn = styled(Column)`
  gap: 15px;
  width: 100%;
`;
const TextTitle = styled(Text)`
  width: 182px;
  line-height: 20px;
  letter-spacing: 0.32px;
  text-align: left;
  width: 100%;
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

const CloseButton = styled.img`
  width: 30px;
  height: 30px;
  background: ${({ theme }) => theme.colors.bgIcon};
  padding: 8px;
  border-radius: 100px;
  &:hover {
    cursor: pointer;
  }
`;
