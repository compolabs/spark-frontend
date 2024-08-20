import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button";
import { IAssetBlock } from "@components/SelectAssets/AssetBlock";
import SelectAssetsInput from "@components/SelectAssets/SelectAssetsInput";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import TokenInput from "@components/TokenInput";
import arrowLeftShort from "@src/assets/icons/arrowLeftShort.svg";
import closeThin from "@src/assets/icons/closeThin.svg";
import { FuelNetwork } from "@src/blockchain";
import { DEFAULT_DECIMALS } from "@src/constants";
import BN from "@src/utils/BN";
import { useStores } from "@stores";

interface DepositAssets {
  setStep: (value: number) => void;
}

const DepositAssets = observer(({ setStep }: DepositAssets) => {
  const [selectAsset, setAssets] = useState<IAssetBlock["token"]>();
  const [amount, setAmount] = useState(BN.ZERO);
  const [isLoading, setIsloading] = useState(false);
  const { quickAssetsStore, balanceStore, oracleStore } = useStores();
  const bcNetwork = FuelNetwork.getInstance();
  const closeAssets = () => {
    quickAssetsStore.setCurrentStep(0);
    quickAssetsStore.setQuickAssets(false);
  };

  const handleClick = async () => {
    if (!selectAsset || !amount) return;
    setIsloading(true);
    await balanceStore.depositBalance(selectAsset.asset.assetId, amount.toString());
    setIsloading(false);
    setStep(0);
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

  const handleSetMax = () => {
    if (!selectAsset) return;
    setAmount(BN.parseUnits(selectAsset?.walletBalance, selectAsset.asset.decimals));
  };

  return (
    <>
      <SmartFlex alignItems="center" justifyContent="space-between">
        <SmartFlex alignItems="center" gap="10px">
          <BackButton alt="arrow left" src={arrowLeftShort} onClick={() => setStep(0)} />
          <TextTitle type={TEXT_TYPES.TITLE_MODAL} primary>
            Deposit
          </TextTitle>
        </SmartFlex>
        <CloseButton alt="icon close" src={closeThin} onClick={closeAssets} />
      </SmartFlex>
      <SmartFlexContainer column>
        <SmartFlex gap="10px" column>
          <SelectAssetsInput
            dataAssets={balanceData}
            selected={selectAsset?.assetId}
            showBalance="walletBalance"
            onSelect={(el) => {
              setAssets(el);
            }}
          />
        </SmartFlex>
        <Button disabled={isLoading || !selectAsset || !amount.toNumber()} green onClick={handleClick}>
          Confirm
        </Button>
      </SmartFlexContainer>
    </>
  );
});

export default DepositAssets;

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

const TokenInputDeposit = styled(TokenInput)`
  height: 65px;
`;

const SmartFlexContainer = styled(SmartFlex)`
  width: 100%;
  margin-top: 20px;
  height: calc(100% - 54px);
  gap: 10px;
  justify-content: space-between;
`;
