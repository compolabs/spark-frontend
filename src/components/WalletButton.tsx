import React, { useState } from "react";
import styled from "@emotion/styled";
import copy from "copy-to-clipboard";
import { observer } from "mobx-react";

import Divider from "@components/Divider";
import { Column, Row } from "@components/Flex";
import Text, { TEXT_TYPES } from "@components/Text";
import Tooltip from "@components/Tooltip";
import copyIcon from "@src/assets/icons/copy.svg";
import linkIcon from "@src/assets/icons/link.svg";
import logoutIcon from "@src/assets/icons/logout.svg";
import { FuelNetwork } from "@src/blockchain";
import { useWallet } from "@src/hooks/useWallet";
import BN from "@src/utils/BN";
import { getExplorerLinkByAddress } from "@src/utils/getExplorerLink";
import { useStores } from "@stores";

import WalletAddressButton from "./Header/WalletAddressButton";

const WalletButton: React.FC = observer(() => {
  const { accountStore, notificationStore, balanceStore } = useStores();
  const { disconnect: disconnectWallet } = useWallet();

  const [isFocused, setIsFocused] = useState(false);

  const bcNetwork = FuelNetwork.getInstance();

  const ethBalance = BN.formatUnits(
    balanceStore.getBalance(bcNetwork!.getTokenBySymbol("ETH").assetId) ?? BN.ZERO,
    bcNetwork!.getTokenBySymbol("ETH").decimals,
  )?.toFormat(4);

  const handleAddressCopy = () => {
    accountStore.address && copy(accountStore.address);
    notificationStore.info({ text: "Your address was copied" });
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
      action: () => accountStore.address && window.open(getExplorerLinkByAddress(accountStore.address)),
      title: "View in Explorer",
      active: true,
    },
    {
      icon: logoutIcon,
      action: () => disconnectWallet(),
      title: "Disconnect",
      active: true,
    },
  ];

  const renderActions = () => {
    return actions.map(
      ({ title, action, active, icon }) =>
        active && (
          <ActionRow key={title} onClick={action}>
            <Icon alt="ETH" src={icon} />
            <Text type={TEXT_TYPES.BUTTON_SECONDARY} primary>
              {title}
            </Text>
          </ActionRow>
        ),
    );
  };

  return (
    <Tooltip
      config={{
        placement: "bottom-start",
        trigger: "click",
        onVisibleChange: setIsFocused,
      }}
      content={
        <Column crossAxisSize="max">
          <ActionRow>
            <Icon alt="ETH" src={bcNetwork?.getTokenBySymbol("ETH").logo} />
            <Text type={TEXT_TYPES.H} primary>{`${ethBalance} ETH`}</Text>
          </ActionRow>
          <Divider />
          {renderActions()}
        </Column>
      }
    >
      <WalletAddressButton isFocused={isFocused} />
    </Tooltip>
  );
});

export default WalletButton;

const Icon = styled.img`
  width: 24px;
  height: 24px;
`;

const ActionRow = styled(Row)`
  padding: 8px 16px;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  transition: background-color 150ms;

  &:hover {
    background-color: ${({ theme }) => theme.colors.borderPrimary};
  }
`;
