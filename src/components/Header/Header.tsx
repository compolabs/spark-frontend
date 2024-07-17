import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button";
import ConnectedWallet from "@components/Header/ConnectedWallet";
import Tab from "@components/Tab";
import { TEXT_TYPES } from "@components/Text";
import Logo from "@src/assets/icons/logo.svg?react";
import Menu from "@src/assets/icons/menu.svg?react";
import { MENU_ITEMS } from "@src/constants";
import useFlag from "@src/hooks/useFlag";
import { useMedia } from "@src/hooks/useMedia";
import { useWallet } from "@src/hooks/useWallet";
import ConnectWalletDialog from "@src/screens/ConnectWallet";
import { MODAL_TYPE } from "@src/stores/ModalStore";
import { media } from "@src/themes/breakpoints";
import isRoutesEquals from "@src/utils/isRoutesEquals";
import { useStores } from "@stores";

import { AccountInfoSheet } from "../Modal";
import { SmartFlex } from "../SmartFlex";

import ConnectedWalletButton from "./ConnectedWalletButton";
import DepositWithdrawModal from "./DepositWithdrawModal";
import MobileMenu from "./MobileMenu";

const Header: React.FC = observer(() => {
  const { tradeStore, modalStore, accountStore, mixPanelStore } = useStores();
  const { isConnected, wallet } = useWallet();
  const location = useLocation();
  const media = useMedia();

  const [isMobileMenuOpen, openMobileMenu, closeMobileMenu] = useFlag();
  const [isConnectDialogVisible, openConnectDialog, closeConnectDialog] = useFlag();
  const [isAccountInfoSheetOpen, openAccountInfo, closeAccountInfo] = useFlag();

  useEffect(() => {
    if (!isConnected || !wallet) return;

    accountStore.connect(wallet);
  }, [isConnected, wallet]);

  const toggleMenu = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };

  const renderWallet = () => {
    if (!accountStore.address) {
      return (
        <WalletContainer>
          <Button fitContent green onClick={openConnectDialog}>
            Connect wallet
          </Button>
        </WalletContainer>
      );
    }

    if (media.mobile) {
      return (
        <WalletContainer isVisible={!isMobileMenuOpen}>
          <ConnectedWalletButton onClick={openAccountInfo} />
        </WalletContainer>
      );
    }

    return (
      <WalletContainer>
        <ConnectedWallet />
      </WalletContainer>
    );
  };

  const renderDepositButton = () => {
    if (!tradeStore.isPerpAvailable) return;

    return (
      <Button fitContent onClick={() => modalStore.open(MODAL_TYPE.DEPOSIT_WITHDRAW_MODAL)}>
        DEPOSIT / WITHDRAW
      </Button>
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
          <MenuContainer onClick={toggleMenu}>
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
            {MENU_ITEMS.map(({ title, link, route }) => {
              if (!link && !route)
                return (
                  <Tab key={title} type={TEXT_TYPES.BUTTON_SECONDARY}>
                    {title}
                  </Tab>
                );
              else if (route)
                return (
                  <Link key={title} to={route}>
                    <Tab
                      key={title}
                      active={isRoutesEquals(route, location.pathname)}
                      type={TEXT_TYPES.BUTTON_SECONDARY}
                    >
                      {title}
                    </Tab>
                  </Link>
                );
              else if (link)
                return (
                  <a
                    key={title}
                    href={link}
                    rel="noopener noreferrer"
                    target="_blank"
                    onClick={() => mixPanelStore.trackEvent("desktopHeaderClick", { route: title })}
                  >
                    <Tab key={title} type={TEXT_TYPES.BUTTON_SECONDARY}>
                      {title}
                    </Tab>
                  </a>
                );
              else return null;
            })}
          </SmartFlex>
        </SmartFlex>
        <SmartFlex center="y" gap="16px">
          {renderDepositButton()}
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
        onDepositWithdrawClick={() => modalStore.open(MODAL_TYPE.DEPOSIT_WITHDRAW_MODAL)}
        onWalletConnect={openConnectDialog}
      />
      {isConnectDialogVisible ? (
        <ConnectWalletDialog visible={isConnectDialogVisible} onClose={closeConnectDialog} />
      ) : null}
      <AccountInfoSheet isOpen={isAccountInfoSheetOpen} onClose={closeAccountInfo} />
      <DepositWithdrawModal visible={modalStore.isOpen(MODAL_TYPE.DEPOSIT_WITHDRAW_MODAL)} onClose={modalStore.close} />
    </Root>
  );
});

export default Header;

const Root = styled(SmartFlex)`
  justify-content: space-between;
  width: 100%;
  height: 56px;
  min-height: 48px;
  padding: 0 12px;

  ${media.mobile} {
    height: 40px;
    min-height: 40px;
    padding: 0 8px;
    margin: 4px 0;
  }
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
