import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import { useStores } from "@stores";

import Button from "../Button";
import MenuOverlay from "../MenuOverlay";
import SizedBox from "../SizedBox";
import { SmartFlex } from "../SmartFlex";

import { MenuNav } from "./MenuNav";
import WalletAddressButton from "./WalletAddressButton";

interface MobileMenuProps {
  isOpen: boolean;
  onAccountClick: () => void;
  onWalletConnect: () => void;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = observer(({ isOpen, onAccountClick, onWalletConnect, onClose }) => {
  const { accountStore } = useStores();

  const handleAccountClick = () => {
    onAccountClick();
    onClose();
  };

  const handleConnectWallet = () => {
    onWalletConnect();
    onClose();
  };

  const renderWalletAddressButton = () => {
    return accountStore.address ? (
      <WalletAddressButtonStyled onClick={handleAccountClick} />
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
          {renderWalletAddressButton()}
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

const WalletAddressButtonStyled = styled(WalletAddressButton)`
  width: 100%;
  height: 40px;
`;
