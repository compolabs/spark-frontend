import React, { useEffect } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button";
import ConnectedWallet from "@components/Header/ConnectedWallet";
import DataBase from "@src/assets/icons/dataBase.svg?react";
import Logo from "@src/assets/icons/logo.svg?react";
import Menu from "@src/assets/icons/menu.svg?react";
import useFlag from "@src/hooks/useFlag";
import { useMedia } from "@src/hooks/useMedia";
import ConnectWalletDialog from "@src/screens/ConnectWallet";
import { media } from "@src/themes/breakpoints";
import { useStores } from "@stores";

import { AccountInfoSheet } from "../Modal";
import { SmartFlex } from "../SmartFlex";

import ConnectedWalletButton from "./ConnectedWalletButton";
import { MenuNav } from "./MenuNav";
import MobileMenu from "./MobileMenu";

const Header: React.FC = observer(() => {
  const { accountStore, quickAssetsStore } = useStores();
  const media = useMedia();

  const [isMobileMenuOpen, openMobileMenu, closeMobileMenu] = useFlag();
  const [isConnectDialogVisible, openConnectDialog, closeConnectDialog] = useFlag();
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

  const renderWallet = () => {
    const dataOnboardingConnectKey = `connect-${media.mobile ? "mobile" : "desktop"}`;

    if (!accountStore.address) {
      return (
        <WalletContainer data-onboarding={dataOnboardingConnectKey}>
          <Button fitContent green onClick={openConnectDialog}>
            Connect wallet
          </Button>
        </WalletContainer>
      );
    }

    if (media.mobile) {
      return (
        <WalletContainer data-onboarding={dataOnboardingConnectKey} isVisible={!isMobileMenuOpen}>
          <ConnectedWalletButton onClick={openAccountInfo} />
        </WalletContainer>
      );
    }

    return (
      <WalletContainer data-onboarding={dataOnboardingConnectKey}>
        <ConnectedWallet />
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
        onWalletConnect={openConnectDialog}
      />
      {isConnectDialogVisible ? (
        <ConnectWalletDialog visible={isConnectDialogVisible} onClose={closeConnectDialog} />
      ) : null}
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
