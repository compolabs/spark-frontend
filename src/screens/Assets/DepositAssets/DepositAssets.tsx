import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button";
import { IAssetBlock } from "@components/SelectAssets/AssetBlock";
import SelectAssetsInput from "@components/SelectAssets/SelectAssetsInput";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";

import arrowLeftShort from "@assets/icons/arrowLeftShort.svg";
import closeThin from "@assets/icons/closeThin.svg";
import ErrorWallet from "@assets/icons/errorWallet.svg?react";
import Spinner from "@assets/icons/spinner.svg?react";
import WalletIcon from "@assets/icons/wallet.svg?react";

import { useStores } from "@stores";

import { BalanceBlock } from "@screens/Assets/BalanceBlock/BalanceBlock";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";

import { FuelNetwork } from "@blockchain";

interface DepositAssets {
  setStep: (value: number) => void;
}

const DepositAssets = observer(({ setStep }: DepositAssets) => {
  const [selectAsset, setAssets] = useState<IAssetBlock["token"]>();
  const [amount, setAmount] = useState(BN.ZERO);
  const [isLoading, setIsloading] = useState(false);
  const { quickAssetsStore, balanceStore, oracleStore } = useStores();
  const bcNetwork = FuelNetwork.getInstance();
  const navigate = useNavigate();
  const closeAssets = () => {
    quickAssetsStore.setCurrentStep(0);
    quickAssetsStore.setQuickAssets(false);
  };

  const handleClick = async () => {
    if (!selectAsset || !amount) return;
    setIsloading(true);
    try {
      const response = await balanceStore.depositBalance(
        selectAsset.asset.assetId,
        BN.parseUnits(BN.formatUnits(amount, selectAsset.asset.decimals), selectAsset.asset.decimals).toString(),
      );
      setIsloading(false);
      if (response) {
        setStep(0);
        setAmount(BN.ZERO);
      }
    } catch (err) {
      console.error("er", err);
    }
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

  const hasPositiveBalance = balanceData.some((item) => new BN(item.balance).isGreaterThan(BN.ZERO));

  const isInputError = new BN(BN.formatUnits(amount.toString(), DEFAULT_DECIMALS)).gt(selectAsset?.walletBalance ?? 0);
  return (
    <>
      <SmartFlex alignItems="center" justifyContent="space-between">
        <SmartFlex alignItems="center" gap="10px">
          <BackButton alt="arrow left" src={arrowLeftShort} onClick={() => setStep(0)} />
          <TextTitle type={TEXT_TYPES.TEXT_BIG} primary>
            Deposit
          </TextTitle>
        </SmartFlex>
        <CloseButton alt="icon close" src={closeThin} onClick={closeAssets} />
      </SmartFlex>
      <SmartFlexContainer column>
        {hasPositiveBalance ? (
          <SmartFlex gap="20px" column>
            <SelectAssetsInput
              amount={amount}
              dataAssets={balanceData}
              decimals={selectAsset?.asset.decimals}
              selected={selectAsset?.assetId}
              showBalance="walletBalance"
              onChangeValue={(el) => {
                setAmount(el);
              }}
              onSelect={(el) => {
                setAssets(el);
              }}
            />
            {selectAsset && (
              <BalanceBlock
                icon={<WalletIcon />}
                nameWallet="Wallet balance"
                showBalance="walletBalance"
                token={selectAsset}
              />
            )}
          </SmartFlex>
        ) : (
          <DepositedAssets alignItems="center" gap="20px" justifyContent="center" column>
            <ErrorWallet />
            <TextTitleDeposit type={TEXT_TYPES.TEXT}>
              You wallet is empty.
              <br /> To get test tokens use{" "}
              <LinkStyled
                onClick={() => {
                  navigate("/faucet");
                  closeAssets();
                }}
              >
                faucet
              </LinkStyled>
            </TextTitleDeposit>
          </DepositedAssets>
        )}
        <ButtonConfirm
          disabled={isInputError || isLoading || !selectAsset || !amount.toNumber()}
          fitContent
          onClick={handleClick}
        >
          {isLoading ? <Spinner height={14} /> : "Confirm"}
        </ButtonConfirm>
      </SmartFlexContainer>
    </>
  );
});

export default DepositAssets;

const ButtonConfirm = styled(Button)`
  width: 100%;
`;
const LinkStyled = styled.a`
  color: ${({ theme }) => theme.colors.greenLight};
  text-decoration: underline;
  &:hover {
    cursor: pointer;
  }
`;

const TextTitle = styled(Text)`
  text-align: left;
`;

const TextTitleDeposit = styled(Text)`
  text-align: center;
  width: 400px;
`;

const DepositedAssets = styled(SmartFlex)`
  height: 100%;
  width: 100%;
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
