import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import { useStores } from "@stores";

import Button from "../Button";
import MenuOverlay from "../MenuOverlay";
import SizedBox from "../SizedBox";
import { SmartFlex } from "../SmartFlex";

import ConnectedWalletButton from "./ConnectedWalletButton";
import { MenuNav } from "./MenuNav";

interface IProps {
  isOpen: boolean;
  onAccountClick: () => void;
  onWalletConnect: () => void;
  onClose: () => void;
}

const MobileMenu: React.FC<IProps> = observer(({ isOpen, onAccountClick, onWalletConnect, onClose }) => {
  const { accountStore, quickAssetsStore } = useStores();

  const handleAccountClick = () => {
    onAccountClick();
    onClose();
  };

  const handleConnectWallet = () => {
    onWalletConnect();
    onClose();
  };

  const renderWalletButton = () => {
    return accountStore.address ? (
      <ConnectedWalletButtonStyled onClick={handleAccountClick} />
    ) : (
      <Button green onClick={handleConnectWallet}>
        Connect wallet
      </Button>
    );
  };

  return (
    <MenuOverlay isOpen={isOpen} top={50} zIndex={300}>
      <Body>
        <Container>
          <MenuNav isMobile onMenuClick={onClose} />
        </Container>
        <SizedBox height={8} />
        <FooterContainer gap="8px" column>
          <Button data-onboarding="assets-mobile" onClick={() => quickAssetsStore.setQuickAssets(true)}>
            ASSETS
          </Button>
          {renderWalletButton()}
        </FooterContainer>
      </Body>
    </MenuOverlay>
  );
});

export default MobileMenu;

const Body = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.bgPrimary};
`;

const Container = styled(SmartFlex)`
  flex-direction: column;
  background: ${({ theme }) => `${theme.colors.bgSecondary}`};

  padding-top: 8px;

  border-radius: 10px;
  gap: 8px;
  height: 100%;
`;

const FooterContainer = styled(SmartFlex)`
  margin-bottom: 48px;
  width: 100%;
`;

const ConnectedWalletButtonStyled = styled(ConnectedWalletButton)`
  width: 100%;
  height: 40px;
`;
