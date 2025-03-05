import React, { useEffect } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { useConnectUI } from "@fuels/react";
import { FuelConnector } from "fuels";
import { observer } from "mobx-react";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";

import { Dialog } from "@components/Dialog";
import Text from "@components/Text";

import ArrowRightIcon from "@assets/icons/arrowRightNew.svg?react";
import CloseIcon from "@assets/icons/close.svg?react";

import { useMedia } from "@hooks/useMedia";

import { FUELET_APP_LINK } from "@constants";

import Sheet from "./Sheet";
import { SmartFlex } from "./SmartFlex";

type IProps = Omit<IDialogPropTypes, "onClose"> & {
  onClose: () => void;
  visible: boolean;
};

const WalletConnectors: React.FC<IProps> = observer(({ onClose, visible }) => {
  const theme = useTheme();
  const media = useMedia();

  const {
    connectors,
    isConnected,
    dialog: { connect },
  } = useConnectUI();

  useEffect(() => {
    if (isConnected) {
      onClose();
    }
  }, [isConnected]);

  const renderHeader = () => (
    <HeaderContainer>
      <Text color={theme.colors.textIconPrimary} type="CP_Header_18_Medium" uppercase>
        Connect Wallet
      </Text>
      <CloseIconStyled onClick={onClose} />
    </HeaderContainer>
  );

  const renderConnector = (connector: FuelConnector) => {
    const icon =
      typeof connector.metadata.image === "string" ? connector.metadata.image : connector.metadata.image?.dark;

    return (
      <ConnectorItem key={connector.name} onClick={() => connect(connector)}>
        {icon && <ConnectorItemIcon alt={connector.name} src={icon} />}
        <Text type="CP_Body_16_Medium" primary>
          {connector.name}
        </Text>
      </ConnectorItem>
    );
  };

  const onCreateWallet = () => {
    window.open(FUELET_APP_LINK, "_blank");
  };

  const renderContent = () => {
    return (
      <>
        <SmartFlex column>{connectors.map(renderConnector)}</SmartFlex>
        <FooterContainer center="y" justifyContent="space-between">
          <Text type="CP_Body_16_Medium" primary>
            Don&apos;t have a wallet?
          </Text>
          <SkipButton onClick={onCreateWallet}>
            <Text color="inherit" type="CP_Body_16_Medium">
              Create one
            </Text>
            <ArrowRightIcon />
          </SkipButton>
        </FooterContainer>
      </>
    );
  };

  if (!visible) return;

  if (media.mobile) {
    return (
      <Sheet isOpen={visible} onClose={onClose}>
        {renderHeader()}
        {renderContent()}
      </Sheet>
    );
  }

  return (
    <Dialog title={renderHeader()} visible={visible} onClose={onClose}>
      {renderContent()}
    </Dialog>
  );
});

export default WalletConnectors;

const HeaderContainer = styled(SmartFlex)`
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.strokePrimary};
`;

const FooterContainer = styled(SmartFlex)`
  width: 100%;
  padding: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.strokePrimary};
`;

const CloseIconStyled = styled(CloseIcon)`
  width: 14px;
  height: 14px;

  path {
    fill: ${({ theme }) => theme.colors.textIconPrimary};
  }

  cursor: pointer;
`;

const SkipButton = styled(SmartFlex)`
  cursor: pointer;
  align-items: center;
  gap: 8px;

  color: ${({ theme }) => theme.colors.blueVioletStrong};
`;

const ConnectorItem = styled(SmartFlex)`
  width: 100%;
  padding: 24px;

  align-items: center;
  gap: 8px;

  border-top: 1px solid ${({ theme }) => theme.colors.strokePrimary};

  &:hover {
    background-color: ${({ theme }) => theme.colors.accentPrimary};
  }

  cursor: pointer;

  &:first-of-type {
    border-top: unset;
  }
`;

const ConnectorItemIcon = styled.img`
  height: 24px;
  width: 24px;
  border-radius: 4px;
`;
