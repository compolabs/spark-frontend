import React, { useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button.tsx";
import { IAssetBlock } from "@components/SelectAssets/AssetBlock.tsx";
import SelectAssets from "@components/SelectAssets/SelectAssets.tsx";
import { SmartFlex } from "@components/SmartFlex.tsx";
import Text, { TEXT_TYPES } from "@components/Text.tsx";
import TokenInput from "@components/TokenInput";
import arrowLeftShort from "@src/assets/icons/arrowLeftShort.svg";
import closeThin from "@src/assets/icons/closeThin.svg";
import { FuelNetwork } from "@src/blockchain";
import BN from "@src/utils/BN.ts";
import { useStores } from "@stores";

interface WithdrawAssets {
  setStep: (value: number) => void;
}

const DepositAssets = observer(({ setStep }: WithdrawAssets) => {
  const [selectAsset, setAssets] = useState<IAssetBlock["token"]>();
  const [amount, setAmount] = useState<BN>(new BN(0));
  const [isLoading, setIsloading] = useState<boolean>(false);
  const { quickAssetsStore, balanceStore } = useStores();
  const bcNetwork = FuelNetwork.getInstance();
  const closeAssets = () => {
    quickAssetsStore.setQuickAssets(false);
  };

  const handleClick = async () => {
    if (!selectAsset || !amount) return;
    setIsloading(true);
    await balanceStore.withdrawBalance(selectAsset.asset.assetId, amount.toNumber());
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
      return {
        asset: token,
        walletBalance: BN.formatUnits(balance, token.decimals).toString(),
        contractBalance: BN.formatUnits(contractBalance, token.decimals).toString(),
        balance: BN.formatUnits(totalBalance, token.decimals).toString(),
        assetId,
      };
    });

  return (
    <>
      <SmartFlex alignItems="center" justifyContent="space-between">
        <BackButton alt="arrow left" src={arrowLeftShort} onClick={() => setStep(0)} />
        <TextTitle type={TEXT_TYPES.BUTTON} primary>
          Select asset to withdraw
        </TextTitle>
        <CloseButton alt="icon close" src={closeThin} onClick={closeAssets} />
      </SmartFlex>
      <SmartFlex
        gap="10px"
        justifyContent="space-between"
        style={{ width: "100%", marginTop: 20, height: "calc(100% - 54px)" }}
        column
      >
        <SmartFlex gap="10px" column>
          <SelectAssets
            dataAssets={balanceData}
            selected={selectAsset?.assetId}
            showBalance="contractBalance"
            onSelect={(el) => {
              setAssets(el);
            }}
          />
          <TokenInputDeposit
            amount={amount}
            assetId={selectAsset?.assetId}
            decimals={selectAsset?.asset?.decimals ?? 2}
            setAmount={setAmount}
            styleInputContainer={{ height: 56 }}
          />
        </SmartFlex>
        <Button disabled={isLoading || !selectAsset || !amount.toNumber()} green onClick={handleClick}>
          Confirm
        </Button>
      </SmartFlex>
    </>
  );
});

export default DepositAssets;

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

const BackButton = styled.img`
  &:hover {
    cursor: pointer;
  }
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

const TokenInputDeposit = styled(TokenInput)`
  height: 65px;
`;
