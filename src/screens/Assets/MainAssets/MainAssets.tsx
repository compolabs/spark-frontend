import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button";
import { Column } from "@components/Flex";
import AssetBlock from "@components/SelectAssets/AssetBlock";
import SizedBox from "@components/SizedBox";
import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";
import { media } from "@themes/breakpoints";

import closeThin from "@assets/icons/closeThin.svg";
import DepositAssets from "@assets/icons/depositAssets.svg?react";

import { useWallet } from "@hooks/useWallet";
import { useStores } from "@stores";
import { MIXPANEL_EVENTS } from "@stores/MixPanelStore";
import { MODAL_TYPE } from "@stores/ModalStore";

import { BRIDGE_LINK } from "@constants";
import BN from "@utils/BN";

interface MainAssetsProps {
  setStep: (value: number) => void;
}

const MainAssets: React.FC<MainAssetsProps> = observer(({ setStep }) => {
  const { balanceStore, quickAssetsStore, mixPanelStore, modalStore } = useStores();
  const { isConnected } = useWallet();
  // const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  const balancesInfoList = balanceStore.formattedBalanceInfoList;
  const hasPositiveBalance = balancesInfoList.some((item) => !new BN(item.contractBalance).isZero());
  const accumulateBalance = balancesInfoList.reduce(
    (acc, account) => {
      const balanceValue = new BN(account.balance).multipliedBy(account.price);
      const contractBalanceValue = new BN(account.contractBalance).multipliedBy(account.price);
      const walletBalance = new BN(account.walletBalance).multipliedBy(account.price);
      return {
        balance: acc.balance.plus(balanceValue),
        contractBalance: acc.contractBalance.plus(contractBalanceValue),
        walletBalance: acc.walletBalance.plus(walletBalance),
      };
    },
    { balance: BN.ZERO, contractBalance: BN.ZERO, walletBalance: BN.ZERO },
  );

  // const handleWithdraw = async () => {
  //   setIsLoading(true);
  //   await balanceStore.withdrawBalanceAll();
  //   setIsLoading(false);
  // };

  const closeAssets = () => {
    quickAssetsStore.setCurrentStep(0);
    quickAssetsStore.setQuickAssets(false);
  };

  const renderOverallContent = ({ isConnected, balance }: { isConnected: boolean; balance: BN }) => {
    return (
      <OverallBlock justifyContent="space-between">
        <Text color={theme.colors.textPrimary} type="BUTTON">
          Overall
        </Text>
        <Text color={theme.colors.greenLight}>${new BN(isConnected ? balance : BN.ZERO).toSignificant(2)}</Text>
      </OverallBlock>
    );
  };

  return (
    <AssetsContainer justifyContent="space-between" column>
      <SmartFlex alignItems="center" justifyContent="space-between" column>
        <HeaderBlock alignItems="center" gap="10px" justifyContent="space-between">
          <TextTitle
            type="TEXT_BIG"
            primary
            onClick={() => mixPanelStore.trackEvent(MIXPANEL_EVENTS.CLICK_ASSETS, { page_name: location.pathname })}
          >
            Assets in V12
          </TextTitle>
          <CloseButton alt="Close Assets" src={closeThin} onClick={closeAssets} />
        </HeaderBlock>
        <WalletBlock gap="8px" column>
          {isConnected ? (
            accumulateBalance.contractBalance.isGreaterThan(BN.ZERO) && (
              <>
                {balancesInfoList.map((el) => {
                  const balance = new BN(el.contractBalance).isGreaterThan(BN.ZERO);
                  if (!balance) return;

                  return (
                    <AssetItem key={el.assetId}>
                      <AssetBlock options={{ showBalance: "contractBalance" }} token={el} />
                    </AssetItem>
                  );
                })}
                {renderOverallContent({ isConnected, balance: accumulateBalance.contractBalance })}
              </>
            )
          ) : (
            <>
              <BoxShadow>
                {balancesInfoList.slice(0, 3).map((el) => (
                  <AssetItem key={el.assetId}>
                    <AssetBlock options={{ showBalance: "contractBalance" }} token={el} />
                  </AssetItem>
                ))}
              </BoxShadow>
              {renderOverallContent({ isConnected, balance: accumulateBalance.contractBalance })}
            </>
          )}
        </WalletBlock>
      </SmartFlex>
      {!hasPositiveBalance && isConnected && (
        <DepositedAssets alignItems="center" gap="20px" justifyContent="center" column>
          <DepositAssets />
          <TextTitleDeposit type="TEXT_BIG">
            It looks like you don’t have assets in V12. Tap the{" "}
            <LinkStyled
              to="#"
              onClick={() => {
                quickAssetsStore.setQuickAssets(false);
                window.open(BRIDGE_LINK, "_blank");
              }}
            >
              bridge
            </LinkStyled>{" "}
            to grab some tokens.
          </TextTitleDeposit>
        </DepositedAssets>
      )}
      <BottomColumn justifyContent="space-between">
        {!isConnected && (
          <>
            <SizedBoxStyled width={150}>
              <Text type="BUTTON">Connect wallet to see your assets and trade</Text>
            </SizedBoxStyled>
            <Button green onClick={() => modalStore.open(MODAL_TYPE.CONNECT)}>
              Connect wallet
            </Button>
          </>
        )}
        {accumulateBalance.contractBalance.isPositive() && (
          <SmartFlexBlock>
            <ButtonConfirm fitContent onClick={() => setStep(1)}>
              Withdraw
            </ButtonConfirm>
            {/* <ButtonConfirm disabled={isLoading} fitContent onClick={handleWithdraw}>
              {isLoading ? <Spinner height={14} /> : "Withdraw All"}
            </ButtonConfirm> */}
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
  margin-bottom: 10px;
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
  margin-top: 20px;
`;
const BottomColumn = styled(Column)`
  gap: 15px;
  width: 100%;
`;
const TextTitle = styled(Text)`
  width: 100%;
  text-align: left;
`;

const TextTitleDeposit = styled(TextTitle)`
  text-align: center;
`;

const AssetsContainer = styled(SmartFlex)`
  height: 100%;
`;

const BoxShadow = styled(SmartFlex)`
  position: relative;
  flex-direction: column;
  gap: 8px;

  &:after {
    content: "";
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0px;
    background: linear-gradient(to bottom, transparent 0px, rgba(34, 34, 34, 0) 10%, rgba(34, 34, 34, 1) 100%);

    ${media.mobile} {
      background: linear-gradient(to bottom, transparent 0px, rgba(0, 0, 0, 0) 10%, rgba(20, 20, 20, 1) 100%);
    }
  }
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

const LinkStyled = styled(Link)`
  color: ${({ theme }) => theme.colors.greenLight};
  text-decoration: underline;
  &:hover {
    cursor: pointer;
  }
`;
