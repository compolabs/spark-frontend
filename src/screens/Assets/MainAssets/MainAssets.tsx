import React, { useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button";
import { Column } from "@components/Flex";
import AssetBlock from "@components/SelectAssets/AssetBlock";
import SizedBox from "@components/SizedBox";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import { assetsMock } from "@screens/Assets/MainAssets/const";
import ConnectWalletDialog from "@screens/ConnectWallet";
import closeThin from "@src/assets/icons/closeThin.svg";
import DepositAssets from "@src/assets/icons/depositAssets.svg?react";
import Spinner from "@src/assets/icons/spinner.svg?react";
import { FuelNetwork } from "@src/blockchain";
import { DEFAULT_DECIMALS } from "@src/constants";
import useFlag from "@src/hooks/useFlag";
import { useWallet } from "@src/hooks/useWallet";
import BN from "@src/utils/BN";
import { useStores } from "@stores";

interface MainAssets {
  setStep: (value: number) => void;
}

const MainAssets = observer(({ setStep }: MainAssets) => {
  const { balanceStore } = useStores();
  const { oracleStore, quickAssetsStore } = useStores();
  const { isConnected } = useWallet();
  const [isConnectDialogVisible, openConnectDialog, closeConnectDialog] = useFlag();
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const bcNetwork = FuelNetwork.getInstance();
  const balanceList = balanceStore.getFormattedContractBalance();
  const hasPositiveBalance = balanceList.some((item) => !new BN(item.balance).isZero());
  const accumulateBalance = balanceList.reduce(
    (acc, account) => {
      const price = BN.formatUnits(oracleStore.getTokenIndexPrice(account.asset.priceFeed), DEFAULT_DECIMALS);
      const balanceValue = new BN(account.balance).multipliedBy(price);
      const contractBalanceValue = new BN(account.contractBalance).multipliedBy(price);

      return {
        balance: acc.balance.plus(balanceValue),
        contractBalance: acc.contractBalance.plus(contractBalanceValue),
      };
    },
    { balance: BN.ZERO, contractBalance: BN.ZERO },
  );

  const handleWithdraw = async () => {
    setIsLoading(true);
    await balanceStore.withdrawBalanceAll();
    setIsLoading(false);
  };
  const closeAssets = () => {
    quickAssetsStore.setCurrentStep(0);
    quickAssetsStore.setQuickAssets(false);
  };

  const assetsMockData = assetsMock.map((el) => {
    const token = bcNetwork!.getTokenByAssetId(el.assetId);
    return {
      asset: token,
      ...el,
    };
  });

  return (
    <AssetsContainer justifyContent="space-between" column>
      {isConnectDialogVisible && <ConnectWalletDialog visible={isConnectDialogVisible} onClose={closeConnectDialog} />}
      <SmartFlex alignItems="center" justifyContent="space-between" column>
        <HeaderBlock alignItems="center" gap="10px" justifyContent="space-between">
          <TextTitle type={TEXT_TYPES.TITLE_MODAL} primary>
            Assets
          </TextTitle>
          <CloseButton alt="icon close" src={closeThin} onClick={closeAssets} />
        </HeaderBlock>
        <WalletBlock gap="8px" column>
          {isConnected ? (
            <>
              {accumulateBalance.balance.gt(0) && (
                <>
                  {balanceList.map((el) => (
                    <AssetItem key={el.assetId}>
                      <AssetBlock options={{ showBalance: "balance" }} token={el} />
                    </AssetItem>
                  ))}
                  <OverallBlock justifyContent="space-between">
                    <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON}>
                      Overall
                    </Text>
                    <Text color={theme.colors.greenLight}>
                      ${new BN(isConnected ? accumulateBalance.balance : BN.ZERO).toSignificant(2)}
                    </Text>
                  </OverallBlock>
                </>
              )}
            </>
          ) : (
            <>
              {assetsMockData.map((el) => (
                <>
                  <AssetItem key={el.assetId}>
                    <AssetBlock options={{ showBalance: "contractBalance" }} token={el} />
                  </AssetItem>
                </>
              ))}
              <OverallBlock justifyContent="space-between">
                <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON}>
                  Overall
                </Text>
                <Text color={theme.colors.greenLight}>
                  ${new BN(isConnected ? accumulateBalance.balance : BN.ZERO).toSignificant(2)}
                </Text>
              </OverallBlock>
              <BoxShadow />
            </>
          )}
        </WalletBlock>
      </SmartFlex>
      {!hasPositiveBalance && isConnected && (
        <DepositedAssets alignItems="center" gap="20px" justifyContent="center" column>
          <DepositAssets />
          <TextTitleDeposit>
            It looks like your wallet is empty. Tap the{" "}
            <LinkStyled
              href="/#/faucet"
              onClick={() => {
                quickAssetsStore.setQuickAssets(false);
              }}
            >
              faucet
            </LinkStyled>{" "}
            to grab some tokens.
          </TextTitleDeposit>
        </DepositedAssets>
      )}
      <BottomColumn justifyContent="space-between">
        {!isConnected && (
          <SizedBoxStyled width={150}>
            <Text type={TEXT_TYPES.BUTTON}>Connect wallet to see your assets and trade</Text>
          </SizedBoxStyled>
        )}
        {!isConnected && (
          <Button green onClick={() => openConnectDialog()}>
            Connect wallet
          </Button>
        )}
        {accumulateBalance.contractBalance.gt(0) && (
          <SmartFlexBlock>
            <ButtonConfirm fitContent onClick={() => setStep(1)}>
              Withdraw
            </ButtonConfirm>
            <ButtonConfirm disabled={isLoading} fitContent onClick={handleWithdraw}>
              {isLoading ? <Spinner height={14} /> : "Withdraw All"}
            </ButtonConfirm>
          </SmartFlexBlock>
        )}
      </BottomColumn>
    </AssetsContainer>
  );
});

export default MainAssets;
const ButtonConfirm = styled(Button)`
  width: 100%;
`;
const SmartFlexBlock = styled(SmartFlex)`
  width: 100%;
  gap: 10px;
`;
const SizedBoxStyled = styled(SizedBox)`
  margin: auto;
  text-align: center;
`;
const HeaderBlock = styled(SmartFlex)`
  width: 100%;
`;
const OverallBlock = styled(SmartFlex)`
  margin: 16px 15px;
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
const BottomColumn = styled(Column)`
  gap: 15px;
  width: 100%;
`;
const TextTitle = styled(Text)`
  width: 182px;
  line-height: 20px;
  letter-spacing: 0.32px;
  text-align: left;
`;

const TextTitleDeposit = styled(TextTitle)`
  text-align: center;
  font-size: 14px;
  width: 184px;
`;

const AssetsContainer = styled(SmartFlex)`
  height: 100%;
`;

const BoxShadow = styled(SmartFlex)`
  height: 220px;
  width: calc(100% + 40px);
  position: absolute;
  left: -20px;
  top: 30px;
  background: linear-gradient(to bottom, transparent 0px, rgba(34, 34, 34, 0) 10%, rgba(34, 34, 34, 1) 100%);
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

const LinkStyled = styled.a`
  color: ${({ theme }) => theme.colors.greenLight};
  text-decoration: underline;
  &:hover {
    cursor: pointer;
  }
`;
