import React, { useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";

import Button from "@components/Button";
import { Checkbox } from "@components/Checkbox";
import { Dialog } from "@components/Dialog";
import Text from "@components/Text";

import CloseIcon from "@assets/icons/close.svg?react";

import { useWallet } from "@hooks/useWallet";
import { useStores } from "@stores";
import { MIXPANEL_EVENTS } from "@stores/MixPanelStore";

import { SmartFlex } from "./SmartFlex";

type IProps = Omit<IDialogPropTypes, "onClose"> & {
  onClose: () => void;
  visible: boolean;
};

const ConnectWalletDialog: React.FC<IProps> = observer(({ onClose, visible }) => {
  const { settingsStore, mixPanelStore } = useStores();
  const { connect } = useWallet();
  const [isUserAgreedWithTerms, setIsUserAgreedWithTerms] = useState(settingsStore.isUserAgreedWithTerms ?? false);

  const openWalletConnectUI = () => {
    connect();
    onClose();
  };

  const saveUserAgreement = () => {
    settingsStore.setIsUserAgreedWithTerms(!settingsStore.isUserAgreedWithTerms);
    mixPanelStore.trackEvent(MIXPANEL_EVENTS.AGREE_WITH_TERMS, { agreed: "ok" });

    openWalletConnectUI();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderAgreementOld = () => (
    <>
      <AgreementContainer className="better-scroll">{AGREEMENT_TEXT}</AgreementContainer>
      <ButtonContainer>
        <CheckboxContainer>
          <Checkbox checked={isUserAgreedWithTerms} onChange={() => setIsUserAgreedWithTerms(!isUserAgreedWithTerms)}>
            <Text type="BUTTON_SECONDARY" primary>
              I have read, understand and accept these terms
            </Text>
          </Checkbox>
        </CheckboxContainer>
        <Button disabled={!isUserAgreedWithTerms} green onClick={saveUserAgreement}>
          Agree and Continue
        </Button>
      </ButtonContainer>
    </>
  );

  const renderHeader = () => (
    <HeaderContainer>
      <Text>Terms of use</Text>
      <CloseIconStyled />
    </HeaderContainer>
  );

  const renderAgreement = () => (
    <SmartFlex>
      <SmartFlex>
        <Text></Text>
      </SmartFlex>
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

  return (
    <Dialog title={renderHeader()} visible={visible} onClose={onClose}>
      <Root>{renderContent()}</Root>
    </Dialog>
  );
});

export default ConnectWalletDialog;

const HeaderContainer = styled(SmartFlex)`
  justify-content: space-between;
  padding: 24px;
`;

const CloseIconStyled = styled(CloseIcon)`
  width: 14px;
  height: 14px;
  color: white;
`;

const Root = styled(SmartFlex)`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 24px;
`;

const AgreementContainer = styled(SmartFlex)`
  flex-direction: column;
  overflow: scroll;
  height: 330px;
  padding: 0 24px;
  margin: 24px 0 16px;
  gap: 14px;
`;

const CheckboxContainer = styled(SmartFlex)`
  align-items: center;
  cursor: pointer;
`;

const ButtonContainer = styled(SmartFlex)`
  flex-direction: column;
  gap: 24px;
  padding: 8px 24px;
  width: 100%;
`;

const AGREEMENT_TEXT = (
  <>
    <Text type="BODY" secondary>
      This website-hosted user interface (this &quot;Interface&quot;) is an open source frontend software portal to the
      V12 protocol, a decentralized and community-driven collection of blockchain-enabled smart contracts and tools (the
      &quot;V12 Protocol&quot;). This Interface and the V12 Protocol are made available by the V12 Holding Foundation,
      however all transactions conducted on the protocol are run by related permissionless smart contracts. As the
      Interface is open-sourced and the V12 Protocol and its related smart contracts are accessible by any user, entity
      or third party, there are a number of third party web and mobile user-interfaces that allow for interaction with
      the V12 Protocol.
    </Text>
    <Text type="BODY" secondary>
      THIS INTERFACE AND THE V12 PROTOCOL ARE PROVIDED &quot;AS IS&quot;, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF
      ANY KIND. The V12 Holding Foundation does not provide, own, or control the V12 Protocol or any transactions
      conducted on the protocol or via related smart contracts. By using or accessing this Interface or the V12 Protocol
      and related smart contracts, you agree that no developer or entity involved in creating, deploying or maintaining
      this Interface or the V12 Protocol will be liable for any claims or damages whatsoever associated with your use,
      inability to use, or your interaction with other users of, this Interface or the V12 Protocol, including any
      direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, digital
      assets, tokens, or anything else of value.
    </Text>
    <Text type="BODY" secondary>
      The V12 Protocol is not available to residents of Belarus, the Central African Republic, The Democratic Republic
      of Congo, the Democratic People&apos;s Republic of Korea, the Crimea, Donetsk People&apos;s Republic, and Luhansk
      People&apos;s Republic regions of Ukraine, Cuba, Iran, Libya, Somalia, Sudan, South Sudan, Syria, the USA, Yemen,
      Zimbabwe and any other jurisdiction in which accessing or using the V12 Protocol is prohibited (the
      &quot;Prohibited Jurisdictions&quot;).
    </Text>
    <Text type="BODY" secondary>
      By using or accessing this Interface, the V12 Protocol, or related smart contracts, you represent that you are not
      located in, incorporated or established in, or a citizen or resident of the Prohibited Jurisdictions. You also
      represent that you are not subject to sanctions or otherwise designated on any list of prohibited or restricted
      parties or excluded or denied persons, including but not limited to the lists maintained by the United
      States&apos; Department of Treasury&apos;s Office of Foreign Assets Control, the United Nations Security Council,
      the European Union or its Member States, or any other government authority.
    </Text>
  </>
);
