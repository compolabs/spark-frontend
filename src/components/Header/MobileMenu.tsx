import React from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import Text from "@components/Text";
import { EVENTS, MENU_ITEMS } from "@src/constants";
import { useStores } from "@src/stores";
import { media } from "@src/themes/breakpoints";
import isRoutesEquals from "@src/utils/isRoutesEquals";

import Button from "../Button";
import MenuOverlay from "../MenuOverlay";
import SizedBox from "../SizedBox";
import { SmartFlex } from "../SmartFlex";

import ConnectedWalletButton from "./ConnectedWalletButton";

interface IProps {
  isOpen: boolean;
  onAccountClick: () => void;
  onWalletConnect: () => void;
  onDepositWithdrawClick: () => void;
  onClose: () => void;
}

const MobileMenu: React.FC<IProps> = observer(
  ({ isOpen, onAccountClick, onWalletConnect, onClose, onDepositWithdrawClick }) => {
    const { accountStore, tradeStore, quickAssetsStore } = useStores();
    const location = useLocation();

    const handleAccountClick = () => {
      onAccountClick();
      onClose();
    };

    const handleConnectWallet = () => {
      onWalletConnect();
      onClose();
    };

    const handleDepositWithdrawClick = () => {
      onDepositWithdrawClick();
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

    const createEvents = (events: string) => {
      if (events === EVENTS.OpenSideAssets) {
        quickAssetsStore.setQuickAssets(true);
      }
    };

    return (
      <MenuOverlay isOpen={isOpen} top={50} zIndex={300}>
        <Body>
          <Container>
            {MENU_ITEMS.map(({ title, link, route, events, dataOnboardingKey }) => {
              const dataOnboardingDeviceKey = `${dataOnboardingKey}-${media.mobile ? "mobile" : "desktop"}`;

              if (events) {
                return (
                  <MenuItem key={title} onClick={() => createEvents(events)}>
                    {title}
                  </MenuItem>
                );
              } else if (!link && !route) {
                return (
                  <MenuItem key={title}>
                    <Text>{title}</Text>
                  </MenuItem>
                );
              } else if (route) {
                return (
                  <Link key={title} to={route} onClick={onClose}>
                    <MenuItem isSelected={isRoutesEquals(route, location.pathname)}>
                      <Text data-onboarding={dataOnboardingDeviceKey}>{title}</Text>
                    </MenuItem>
                  </Link>
                );
              } else if (link) {
                return (
                  <a key={title} href={link} rel="noopener noreferrer" target="_blank">
                    <MenuItem>
                      <Text>{title}</Text>
                    </MenuItem>
                  </a>
                );
              }

              return null;
            })}
          </Container>
          <SizedBox height={8} />
          <FooterContainer gap="8px" column>
            <Button data-onboarding="assets-mobile" onClick={() => createEvents(EVENTS.OpenSideAssets)}>
              ASSETS
            </Button>
            {renderWalletButton()}
          </FooterContainer>
        </Body>
      </MenuOverlay>
    );
  },
);

export default MobileMenu;

const Body = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.bgPrimary};
`;

const MenuItem = styled.div<{ isSelected?: boolean }>`
  cursor: pointer;
  padding: 12px 32px;

  ${Text} {
    width: fit-content;
    color: ${({ theme, isSelected }) => (isSelected ? theme.colors.textPrimary : theme.colors.textSecondary)};
    ${media.mobile} {
      font-size: 16px;
    }
  }
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
