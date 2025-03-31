import React from "react";
import styled from "@emotion/styled";
import copy from "copy-to-clipboard";

import { Blockchain } from "@blockchain";
import { BN } from "@blockchain/fuel/types";

import copyIcon from "@assets/icons/copy.svg";
import linkIcon from "@assets/icons/link.svg";
import logoutIcon from "@assets/icons/logout.svg";

import { useWallet } from "@hooks/useWallet";
import { useStores } from "@stores";

import { getExplorerLinkByAddress } from "@utils/getExplorerLink";

import Divider from "../Divider";
import Sheet from "../Sheet";
import { SmartFlex } from "../SmartFlex";
import Text from "../Text";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AccountInfoSheet: React.FC<Props> = ({ isOpen, onClose }) => {
  const { disconnect } = useWallet();
  const { accountStore, notificationStore, balanceStore } = useStores();

  const bcNetwork = Blockchain.getInstance();

  const ethBalance = BN.formatUnits(
    balanceStore.getWalletBalance(bcNetwork.sdk.getTokenBySymbol("ETH").assetId) ?? BN.ZERO,
    bcNetwork.sdk.getTokenBySymbol("ETH").decimals,
  )?.toFormat(4);

  const handleAddressCopy = () => {
    accountStore.address && copy(accountStore.address);
    notificationStore.info({ text: "Your address was copied" });
    onClose();
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  const actions = [
    {
      icon: copyIcon,
      action: handleAddressCopy,
      title: "Copy address",
      active: true,
    },
    {
      icon: linkIcon,
      action: () => window.open(getExplorerLinkByAddress(accountStore.address!)),
      title: "View in Explorer",
      active: true,
    },
  ];

  const renderActions = () => {
    return actions.map(
      ({ title, action, active, icon }) =>
        active && (
          <ActionItem key={title} center="y" onClick={action}>
            <Icon alt="ETH" src={icon} />
            <Text type="BUTTON_SECONDARY" primary>
              {title}
            </Text>
          </ActionItem>
        ),
    );
  };

  return (
    <Sheet isOpen={isOpen} header onClose={onClose}>
      <SmartFlex column>
        <TokenContainer center="y" gap="8px">
          <Icon alt="ETH" src={bcNetwork.sdk.getTokenBySymbol("ETH").logo} />
          <Text type="H" primary>{`${ethBalance} ETH`}</Text>
        </TokenContainer>
        <Divider />
        <SmartFlex center="y" column>
          {renderActions()}
        </SmartFlex>
        <Divider />
        <FooterContainer>
          <ActionItem center="y" onClick={handleDisconnect}>
            <Icon alt="ETH" src={logoutIcon} />
            <Text type="BUTTON_SECONDARY" primary>
              Disconnect
            </Text>
          </ActionItem>
        </FooterContainer>
      </SmartFlex>
    </Sheet>
  );
};

export default AccountInfoSheet;

const TokenContainer = styled(SmartFlex)`
  padding: 8px 16px;
`;

const ActionItem = styled(SmartFlex)`
  padding: 8px 16px;
  gap: 4px;
  width: 100%;

  transition: background-color 150ms;

  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.colors.borderPrimary};
  }
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
`;

const FooterContainer = styled(SmartFlex)`
  margin-bottom: 40px;
`;
