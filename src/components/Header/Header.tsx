import React, { useEffect } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button";
import { media } from "@themes/breakpoints";

import DataBase from "@assets/icons/dataBase.svg?react";
import Logo from "@assets/icons/logo.svg?react";
import Menu from "@assets/icons/menu.svg?react";

import useFlag from "@hooks/useFlag";
import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";
import { MODAL_TYPE } from "@stores/ModalStore";

import { ConnectWalletButton } from "../ConnectWalletButton";
import { AccountInfoSheet } from "../Modal";
import { SmartFlex } from "../SmartFlex";
import WalletButton from "../WalletButton";

import { MenuNav } from "./MenuNav";
import MobileMenu from "./MobileMenu";
import WalletAddressButton from "./WalletAddressButton";

const Header: React.FC = observer(() => {
  const { modalStore, quickAssetsStore } = useStores();
  const media = useMedia();

  const [isMobileMenuOpen, openMobileMenu, closeMobileMenu] = useFlag();
  const [isAccountInfoSheetOpen, openAccountInfo, closeAccountInfo] = useFlag();

  useEffect(() => {
    if (media.desktop) {
      closeMobileMenu();
    }
  }, [media]);

  const toggleMenu = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };

  const openConnectModal = () => modalStore.open(MODAL_TYPE.CONNECT_MODAL);

  const renderWallet = () => {
    const dataOnboardingConnectKey = `connect-${media.mobile ? "mobile" : "desktop"}`;

    const walletButtonContent = media.mobile ? <WalletAddressButton onClick={openAccountInfo} /> : <WalletButton />;

    return (
      <WalletContainer data-onboarding={dataOnboardingConnectKey} isVisible={!isMobileMenuOpen}>
        <ConnectWalletButton fitContent>{walletButtonContent}</ConnectWalletButton>
      </WalletContainer>
    );
  };

  const renderMobile = () => {
    return (
      <>
        <SmartFlex center="y">
          <a href="/" rel="noreferrer noopener">
            <Logo />
          </a>
        </SmartFlex>
        <SmartFlex center="y" gap="8px">
          {renderWallet()}
          <ButtonStyled
            data-onboarding="assets-mobile"
            fitContent
            onClick={() => quickAssetsStore.setQuickAssets(true)}
          >
            <SmartFlex>
              <DataBase />
            </SmartFlex>
          </ButtonStyled>
          <MenuContainer data-onboarding="menu-mobile" onClick={toggleMenu}>
            <Menu />
          </MenuContainer>
        </SmartFlex>
      </>
    );
  };

  const renderDesktop = () => {
    return (
      <>
        <SmartFlex center="y">
          <a href="/" rel="noreferrer noopener">
            <Logo />
          </a>
          <Divider />
          <SmartFlex gap="28px">
            <MenuNav />
          </SmartFlex>
        </SmartFlex>
        <SmartFlex center="y" gap="16px">
          <Button data-onboarding="assets-desktop" fitContent onClick={() => quickAssetsStore.setQuickAssets(true)}>
            <SmartFlex center="y" gap="8px">
              <DataBase />
              Assets
            </SmartFlex>
          </Button>
          {renderWallet()}
        </SmartFlex>
      </>
    );
  };

  return (
    <Root>
      {media.mobile ? renderMobile() : renderDesktop()}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onAccountClick={openAccountInfo}
        onClose={closeMobileMenu}
        onWalletConnect={openConnectModal}
      />
      <AccountInfoSheet isOpen={isAccountInfoSheetOpen} onClose={closeAccountInfo} />
    </Root>
  );
});

export default Header;

const Root = styled(SmartFlex)`
  justify-content: space-between;
  width: 100%;
  height: 56px;
  min-height: 56px;
  padding: 0 12px;

  ${media.mobile} {
    height: 40px;
    min-height: 40px;
    padding: 0 8px;
    margin: 4px 0;
  }
`;

const ButtonStyled = styled(Button)`
  padding: 5px;
  width: 34px;
  height: 34px;
`;

const Divider = styled.div`
  margin: 0 16px;
  width: 1px;
  height: 32px;
  background: ${({ theme }) => theme.colors.bgSecondary};
`;

const MenuContainer = styled(SmartFlex)`
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
  border-radius: 100%;
  padding: 4px;
`;

const WalletContainer = styled(SmartFlex)<{ isVisible?: boolean }>`
  opacity: ${({ isVisible = true }) => (isVisible ? "1" : "0")};
  transition: opacity 150ms;

  ${media.mobile} {
    ${Button} {
      height: 32px;
    }
  }
`;
