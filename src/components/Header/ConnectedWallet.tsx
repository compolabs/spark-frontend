import React, { useState } from "react";
import styled from "@emotion/styled";
import { useDisconnect } from "@fuels/react";
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

import { createToast } from "../Toast";

import ConnectedWalletButton from "./ConnectedWalletButton";

const ConnectedWallet: React.FC = observer(() => {
  const { accountStore, notificationStore, balanceStore } = useStores();
  const { address, refetchWallet, balance } = useWallet();
  const { disconnect } = useDisconnect();

  // TODO: enable wallet balance auto-update ?
  // useEffect(() => {
  //   const interval = setInterval(() => refetchWallet(), 5000);
  //   return () => clearInterval(interval);
  // }, [refetchWallet]);

  const [isFocused, setIsFocused] = useState(false);

  const bcNetwork = FuelNetwork.getInstance();

  const ethBalance = BN.formatUnits(balance?.toString() ?? "0", bcNetwork!.getTokenBySymbol("ETH").decimals).toFormat(
    4,
  );

  const handleAddressCopy = () => {
    address && copy(address);
    notificationStore.toast(createToast({ text: "Your address was copied" }), { type: "info" });
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
      action: () => window.open(getExplorerLinkByAddress(address)),
      title: "View in Explorer",
      active: true,
    },
    {
      icon: logoutIcon,
      action: () => disconnect(),
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
      <ConnectedWalletButton isFocused={isFocused} />
    </Tooltip>
  );
});

export default ConnectedWallet;

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
