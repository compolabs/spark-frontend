import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button";
import { IAssetBlock } from "@components/SelectAssets/AssetBlock";
import SelectAssetsInput from "@components/SelectAssets/SelectAssetsInput";
import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";

import arrowLeftShort from "@assets/icons/arrowLeftShort.svg";
import closeThin from "@assets/icons/closeThin.svg";
import DataBase from "@assets/icons/dataBase.svg?react";
import Spinner from "@assets/icons/spinner.svg?react";
import WalletIcon from "@assets/icons/wallet.svg?react";

import { useStores } from "@stores";

import { BalanceBlock } from "@screens/Assets/BalanceBlock/BalanceBlock";
import { ModalEnums, TypeTransaction } from "@screens/Assets/enums/actionEnums";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";

interface WithdrawAssets {
  setStep: (value: number) => void;
}

export interface ShowAction {
  hash: string;
  transactionInfo: {
    token: IAssetBlock["token"];
    type: TypeTransaction;
    amount: string;
  };
  typeModal: ModalEnums;
}
const WithdrawAssets = observer(({ setStep }: WithdrawAssets) => {
  const { quickAssetsStore, balanceStore } = useStores();

  const [activeAsset, setActiveAsset] = useState<IAssetBlock["token"]>();
  const [amount, setAmount] = useState(BN.ZERO);
  const [isLoading, setIsLoading] = useState(false);

  const isInputError = BN.formatUnits(amount.toString(), activeAsset?.asset.decimals ?? DEFAULT_DECIMALS).gt(
    activeAsset?.contractBalance ?? 0,
  );

  const isConfirmDisabled = isInputError || isLoading || !activeAsset || !amount.toNumber();

  const balanceList = balanceStore.formattedBalanceInfoList;

  const closeAssets = () => {
    quickAssetsStore.setCurrentStep(0);
    quickAssetsStore.setQuickAssets(false);
  };

  const handleClick = async () => {
    if (!activeAsset || !amount) return;
    setIsLoading(true);
    const response = await balanceStore.withdrawBalance(
      activeAsset.asset.assetId,
      BN.parseUnits(BN.formatUnits(amount, activeAsset.asset.decimals), activeAsset.asset.decimals).toString(), // wtf
    );
    setIsLoading(false);
    if (response) {
      setStep(0);
      setAmount(BN.ZERO);
    }
  };

  useEffect(() => {
    setActiveAsset(balanceList[0]);
  }, []);

  return (
    <>
      <SmartFlex alignItems="center" justifyContent="space-between">
        <SmartFlex alignItems="center" gap="10px">
          <BackButton alt="arrow left" src={arrowLeftShort} onClick={() => setStep(0)} />
          <TextTitle type="TEXT_BIG" primary>
            Withdraw
          </TextTitle>
        </SmartFlex>
        <CloseButton alt="icon close" src={closeThin} onClick={closeAssets} />
      </SmartFlex>
      <SmartFlexContainer column>
        <SmartFlex gap="20px" column>
          <SelectAssetsInput
            amount={amount}
            dataAssets={balanceList}
            decimals={activeAsset?.asset?.decimals}
            selected={activeAsset?.assetId}
            showBalance="contractBalance"
            onChangeValue={setAmount}
            onSelect={setActiveAsset}
          />
          {activeAsset && (
            <SmartFlex gap="2px" column>
              <BalanceBlock
                icon={<DataBase />}
                nameWallet="Deposited"
                showBalance="contractBalance"
                token={activeAsset}
              />
              <BalanceBlock
                icon={<WalletIcon />}
                nameWallet="Wallet balance"
                showBalance="walletBalance"
                token={activeAsset}
              />
            </SmartFlex>
          )}
        </SmartFlex>
        <ButtonConfirm disabled={isConfirmDisabled} fitContent onClick={handleClick}>
          {isLoading ? <Spinner height={14} /> : "Confirm"}
        </ButtonConfirm>
      </SmartFlexContainer>
    </>
  );
});

export default WithdrawAssets;

const ButtonConfirm = styled(Button)`
  width: 100%;
`;

const TextTitle = styled(Text)`
  text-align: left;
`;

const BackButton = styled.img`
  &:hover {
    cursor: pointer;
  }
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

const SmartFlexContainer = styled(SmartFlex)`
  width: 100%;
  margin-top: 72px;
  height: calc(100% - 104px);
  gap: 10px;
  justify-content: space-between;
`;
