import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { AnimatePresence } from "framer-motion";
import { observer } from "mobx-react";

import Button from "@components/Button";
import { IAssetBlock } from "@components/SelectAssets/AssetBlock";
import SelectAssetsInput from "@components/SelectAssets/SelectAssetsInput";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import { ActionModal } from "@screens/Assets/ActionModal.tsx";
import { BalanceBlock } from "@screens/Assets/BalanceBlock/BalanceBlock.tsx";
import { ModalEnums, TypeTranaction } from "@screens/Assets/enums/actionEnums.tsx";
import arrowLeftShort from "@src/assets/icons/arrowLeftShort.svg";
import closeThin from "@src/assets/icons/closeThin.svg";
import DataBase from "@src/assets/icons/dataBase.svg?react";
import WalletIcon from "@src/assets/icons/wallet.svg?react";
import { FuelNetwork } from "@src/blockchain";
import { DEFAULT_DECIMALS } from "@src/constants";
import BN from "@src/utils/BN";
import { useStores } from "@stores";

interface WithdrawAssets {
  setStep: (value: number) => void;
}

export interface ShowAction {
  hash: string;
  transactionInfo: {
    token: IAssetBlock["token"];
    type: TypeTranaction;
    amount: string;
  };
  typeModal: ModalEnums;
}
const WithdrawAssets = observer(({ setStep }: WithdrawAssets) => {
  const [selectAsset, setAssets] = useState<IAssetBlock["token"]>();
  const [amount, setAmount] = useState(BN.ZERO);
  const [isLoading, setIsloading] = useState(false);
  const { quickAssetsStore, balanceStore, oracleStore } = useStores();
  const bcNetwork = FuelNetwork.getInstance();
  const [showAction, setShowAction] = useState<ShowAction | null>();
  const closeAssets = () => {
    quickAssetsStore.setCurrentStep(0);
    quickAssetsStore.setQuickAssets(false);
  };

  const handleClick = async () => {
    if (!selectAsset || !amount) return;
    setIsloading(true);
    const data = {
      hash: "",
      transactionInfo: {
        amount: BN.formatUnits(amount, DEFAULT_DECIMALS).toString(),
        token: selectAsset,
        type: TypeTranaction.WITHDRAWAL,
      },
      typeModal: ModalEnums.Pending,
    };
    setShowAction(data);
    try {
      await balanceStore.withdrawBalance(
        selectAsset.asset.assetId,
        BN.parseUnits(BN.formatUnits(amount, DEFAULT_DECIMALS), selectAsset.asset.decimals).toString(),
      );
      data.typeModal = ModalEnums.Success;
      setShowAction(data);
      setTimeout(() => {
        setStep(0);
        setAmount(BN.ZERO);
      }, 1500);
    } catch (err) {
      console.log("err");
      data.typeModal = ModalEnums.Error;
      setShowAction(data);
    }
  };

  const handleCloseAction = () => {
    if (!showAction) return;
    setShowAction(null);
    setIsloading(false);
  };
  const balanceData = Array.from(balanceStore.balances)
    .filter(([, balance]) => balance && balance.gt(BN.ZERO))
    .map(([assetId, balance]) => {
      const token = bcNetwork!.getTokenByAssetId(assetId);
      const contractBalance =
        token.symbol === "USDC" ? balanceStore.myMarketBalance.liquid.quote : balanceStore.myMarketBalance.liquid.base;
      const totalBalance = token.symbol === "ETH" ? balance : contractBalance.plus(balance);
      const price = BN.formatUnits(oracleStore.getTokenIndexPrice(token.priceFeed ?? ""), DEFAULT_DECIMALS);
      return {
        price: price.toString(),
        asset: token,
        walletBalance: BN.formatUnits(balance, token.decimals).toString(),
        contractBalance: BN.formatUnits(contractBalance, token.decimals).toString(),
        balance: BN.formatUnits(totalBalance, token.decimals).toString(),
        assetId,
      };
    });

  useEffect(() => {
    setAssets(balanceData[0]);
  }, []);

  const isInputError = new BN(BN.formatUnits(amount.toString(), DEFAULT_DECIMALS)).gt(
    selectAsset?.contractBalance ?? 0,
  );

  return (
    <>
      <SmartFlex alignItems="center" justifyContent="space-between">
        <SmartFlex alignItems="center" gap="10px">
          <BackButton alt="arrow left" src={arrowLeftShort} onClick={() => setStep(0)} />
          <TextTitle type={TEXT_TYPES.TITLE_MODAL} primary>
            Withdraw
          </TextTitle>
        </SmartFlex>
        <CloseButton alt="icon close" src={closeThin} onClick={closeAssets} />
      </SmartFlex>
      <SmartFlexContainer column>
        <SmartFlex gap="20px" column>
          <SelectAssetsInput
            amount={amount}
            dataAssets={balanceData}
            selected={selectAsset?.assetId}
            showBalance="contractBalance"
            onChangeValue={(el) => {
              setAmount(el);
            }}
            onSelect={(el) => {
              setAssets(el);
            }}
          />
          {selectAsset && (
            <>
              <BalanceBlock
                icon={<DataBase />}
                nameWallet="Deposited"
                showBalance="contractBalance"
                token={selectAsset}
              />
              <BalanceBlock
                icon={<WalletIcon />}
                nameWallet="Wallet baalnce"
                showBalance="walletBalance"
                token={selectAsset}
              />
            </>
          )}
        </SmartFlex>
        <Button disabled={isInputError || isLoading || !selectAsset || !amount.toNumber()} black onClick={handleClick}>
          Confirm
        </Button>
        <AnimatePresence>
          {showAction && (
            <ActionModal
              hash={showAction.hash}
              transactionInfo={showAction.transactionInfo}
              typeModal={showAction.typeModal}
              onClose={handleCloseAction}
            />
          )}
        </AnimatePresence>
      </SmartFlexContainer>
    </>
  );
});

export default WithdrawAssets;

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
  margin-top: 20px;
  height: calc(100% - 54px);
  gap: 10px;
  justify-content: space-between;
`;
