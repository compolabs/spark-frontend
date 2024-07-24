import React from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import Text from "@components/Text";
import { MENU_ITEMS } from "@src/constants";
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
    const { accountStore, tradeStore } = useStores();
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

    return (
      <MenuOverlay isOpen={isOpen} top={50} zIndex={300}>
        <Body>
          <Container>
            {MENU_ITEMS.map(({ title, link, route }) => {
              if (!link && !route) {
                return (
                  <MenuItem key={title}>
                    <Text>{title}</Text>
                  </MenuItem>
                );
              } else if (route) {
                return (
                  <Link key={title} to={route} onClick={onClose}>
                    <MenuItem key={title} isSelected={isRoutesEquals(route, location.pathname)}>
                      <Text>{title}</Text>
                    </MenuItem>
                  </Link>
                );
              } else if (link) {
                return (
                  <a key={title} href={link} rel="noopener noreferrer" target="_blank">
                    <MenuItem key={title}>
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
            {tradeStore.isPerpAvailable ? (
              <Button onClick={handleDepositWithdrawClick}>DEPOSIT / WITHDRAW</Button>
            ) : null}
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
