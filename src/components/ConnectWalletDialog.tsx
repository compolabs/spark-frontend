import React, { useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { AnimatePresence, motion } from "framer-motion";
import { observer } from "mobx-react";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";

import { Dialog } from "@components/Dialog";
import Text from "@components/Text";

import ArrowIcon from "@assets/icons/arrowUpNew.svg?react";
import CloseIcon from "@assets/icons/close.svg?react";

import { useMedia } from "@hooks/useMedia";
import { useWallet } from "@hooks/useWallet";
import { useStores } from "@stores";
import { MIXPANEL_EVENTS } from "@stores/MixPanelStore";

import { ButtonNew } from "./ButtonNew";
import { Checkbox } from "./Checkbox";
import Sheet from "./Sheet";
import { SmartFlex } from "./SmartFlex";

type IProps = Omit<IDialogPropTypes, "onClose"> & {
  onClose: () => void;
  visible: boolean;
};

const dropdownVariants = {
  open: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.3, ease: "easeOut" },
  },
  closed: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

const ConnectWalletDialog: React.FC<IProps> = observer(({ onClose, visible }) => {
  const { settingsStore, mixPanelStore } = useStores();
  const { connect } = useWallet();
  const theme = useTheme();
  const media = useMedia();

  const [isUserAgreedWithTerms, setIsUserAgreedWithTerms] = useState(true);
  const [isUserAcknowledge, setIsUserAcknowledge] = useState(true);

  const [isUserAgrementDropdownOpen, setIsUserAgrementDropdownOpen] = useState(false);

  const userCanProceed = !(isUserAcknowledge && isUserAcknowledge);

  const openWalletConnectUI = () => {
    connect();
    onClose();
  };

  const saveUserAgreement = () => {
    settingsStore.setIsUserAgreedWithTerms(true);
    mixPanelStore.trackEvent(MIXPANEL_EVENTS.AGREE_WITH_TERMS, { agreed: "ok" });

    openWalletConnectUI();
  };

  const renderHeader = () => (
    <HeaderContainer>
      <Text color={theme.colors.textIconPrimary} type="CP_Header_18_Medium" uppercase>
        Terms of use
      </Text>
      <CloseIconStyled />
    </HeaderContainer>
  );

  const handleOpenUserAgrementDropdown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-checkbox]")) {
      return;
    }
    setIsUserAgrementDropdownOpen((v) => !v);
  };

  const handleIsUserAgreedWithTerms = () => {
    setIsUserAgreedWithTerms((v) => !v);
  };

  const renderDropdown = () => (
    <SmartFlex column>
      <DropdownContainer onClick={handleOpenUserAgrementDropdown}>
        <Checkbox checked={isUserAgreedWithTerms} onClick={handleIsUserAgreedWithTerms}>
          <Text color={theme.colors.textIconPrimary} type="CP_Body_16_Medium">
            I accept the Terms of Use
          </Text>
        </Checkbox>
        <ArrowIconStyled open={isUserAgrementDropdownOpen} />
      </DropdownContainer>
      <AnimatePresence>
        {isUserAgrementDropdownOpen && (
          <DropdownContent key="dropdown" animate="open" exit="closed" initial="closed" variants={dropdownVariants}>
            <DropdownContentWrapper>
              <Text color={theme.colors.textIconSecondary} type="CP_Support_10">
                This website-hosted user interface (this &ldquo;Interface&rdquo;) is an open source frontend software
                portal to the Spark protocol, a decentralized and community-driven collection of blockchain-enabled
                smart contracts and tools (the &ldquo;Spark Protocol&rdquo;). This Interface and the Spark Protocol are
                made available by the Spark Holding Foundation, however all transactions conducted on the protocol are
                run by related permissionless smart contracts. As the Interface is open-sourced and the Spark Protocol
                and its related smart contracts are accessible by any user, entity or third party. there are a number of
                third party web and mobile user-interfaces that allow for interaction with the Spark Protocol.
              </Text>
              <Text color={theme.colors.textIconSecondary} type="CP_Support_10">
                THIS INTERFACE AND THE SPARK PROTOCOL ARE PROVIDED &ldquo;AS IS&rdquo;, AT YOUR OWN RISK, AND WITHOUT
                WARRANTIES OF ANY KIND. The Spark Holding Foundation does not provide, own, or control the Spark
                Protocol or any transactions conducted on the protocol or via related smart.
              </Text>
            </DropdownContentWrapper>
          </DropdownContent>
        )}
      </AnimatePresence>
    </SmartFlex>
  );

  const renderAcknowledge = () => (
    <ItemContainer>
      <Checkbox checked={isUserAcknowledge} onChange={() => setIsUserAcknowledge((v) => !v)}>
        <Text color={theme.colors.textIconPrimary} type="CP_Body_16_Medium">
          I acknowledge that I am trading with real money
        </Text>
      </Checkbox>
    </ItemContainer>
  );

  const renderAgreement = () => (
    <SmartFlex column>
      {renderDropdown()}
      {renderAcknowledge()}
      <FooterContainer>
        <ButtonNew disabled={userCanProceed} onClick={saveUserAgreement}>
          <Text color="inherit" type="CP_Button_14_Medium" uppercase>
            Agree and Continue
          </Text>
        </ButtonNew>
      </FooterContainer>
    </SmartFlex>
  );

  const renderContent = () => {
    if (!settingsStore.isUserAgreedWithTerms) {
      return renderAgreement();
    } else {
      openWalletConnectUI();
    }
  };

  if (!visible) return;

  if (media.mobile) {
    return (
      <Sheet isOpen={visible} onClose={onClose}>
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

export default ConnectWalletDialog;

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
  color: white;

  path {
    fill: ${({ theme }) => theme.colors.textIconPrimary};
  }

  cursor: pointer;
`;

const ArrowIconStyled = styled(ArrowIcon)<{ open: boolean }>`
  width: 24px;
  height: 24px;

  padding: 5px;

  transform: ${({ open }) => !open && "rotate(180deg)"};
  transition: transform 250ms ease;

  path {
    fill: ${({ theme }) => theme.colors.textIconPrimary};
  }
`;

const DropdownContainer = styled(SmartFlex)`
  padding: 16px 24px;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.strokePrimary};
`;

const DropdownContent = styled(motion.div)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.strokePrimary};
  overflow: hidden;
`;

const DropdownContentWrapper = styled(SmartFlex)`
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  gap: 10px;
`;

const ItemContainer = styled(SmartFlex)`
  padding: 16px 24px;
  justify-content: space-between;
`;
