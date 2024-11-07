import React, { useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";

import Button from "@components/Button";
import { Checkbox } from "@components/Checkbox";
import { Dialog } from "@components/Dialog";
import Text, { TEXT_TYPES } from "@components/Text";

import { useWallet } from "@hooks/useWallet";
import { useStores } from "@stores";
import { MIXPANEL_EVENTS } from "@stores/MixPanelStore";

type IProps = Omit<IDialogPropTypes, "onClose"> & {
  onClose: () => void;
  visible: boolean;
};

const ConnectWalletDialog: React.FC<IProps> = observer(({ onClose, visible }) => {
  const { settingsStore, mixPanelStore } = useStores();
  const theme = useTheme();
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

  const renderAgreement = () => (
    <>
      <AgreementContainer className="better-scroll">{AGREEMENT_TEXT}</AgreementContainer>
      <ButtonContainer>
        <CheckboxContainer>
          <Checkbox checked={isUserAgreedWithTerms} onChange={() => setIsUserAgreedWithTerms(!isUserAgreedWithTerms)}>
            <Text type={TEXT_TYPES.BUTTON_SECONDARY} primary>
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

  const renderContent = () => {
    if (!settingsStore.isUserAgreedWithTerms) {
      return renderAgreement();
    } else {
      openWalletConnectUI();
    }
  };

  if (!visible) return;

  return (
    <Dialog
      title={
        <HeaderContainer>
          <ArrowContainer>
            <Text color={theme.colors.textPrimary} type={TEXT_TYPES.H}>
              Terms and conditions
            </Text>
          </ArrowContainer>
        </HeaderContainer>
      }
      visible={visible}
      onClose={onClose}
    >
      <Root>{renderContent()}</Root>
    </Dialog>
  );
});

export default ConnectWalletDialog;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 32px 24px 0 24px;
`;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 24px;
`;

const AgreementContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: scroll;
  height: 330px;
  padding: 0 24px;
  margin: 24px 0 16px;
  gap: 14px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 24px;
  width: 100%;
`;

const ArrowContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const AGREEMENT_TEXT = (
  <>
    <Text type={TEXT_TYPES.BODY} secondary>
      This website-hosted user interface (this &quot;Interface&quot;) is an open source frontend software portal to the
      Spark protocol, a decentralized and community-driven collection of blockchain-enabled smart contracts and tools
      (the &quot;Spark Protocol&quot;). This Interface and the Spark Protocol are made available by the Spark Holding
      Foundation, however all transactions conducted on the protocol are run by related permissionless smart contracts.
      As the Interface is open-sourced and the Spark Protocol and its related smart contracts are accessible by any
      user, entity or third party, there are a number of third party web and mobile user-interfaces that allow for
      interaction with the Spark Protocol.
    </Text>
    <Text type={TEXT_TYPES.BODY} secondary>
      THIS INTERFACE AND THE SPARK PROTOCOL ARE PROVIDED &quot;AS IS&quot;, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF
      ANY KIND. The Spark Holding Foundation does not provide, own, or control the Spark Protocol or any transactions
      conducted on the protocol or via related smart contracts. By using or accessing this Interface or the Spark
      Protocol and related smart contracts, you agree that no developer or entity involved in creating, deploying or
      maintaining this Interface or the Spark Protocol will be liable for any claims or damages whatsoever associated
      with your use, inability to use, or your interaction with other users of, this Interface or the Spark Protocol,
      including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of
      profits, digital assets, tokens, or anything else of value.
    </Text>
    <Text type={TEXT_TYPES.BODY} secondary>
      The Spark Protocol is not available to residents of Belarus, the Central African Republic, The Democratic Republic
      of Congo, the Democratic People&apos;s Republic of Korea, the Crimea, Donetsk People&apos;s Republic, and Luhansk
      People&apos;s Republic regions of Ukraine, Cuba, Iran, Libya, Somalia, Sudan, South Sudan, Syria, the USA, Yemen,
      Zimbabwe and any other jurisdiction in which accessing or using the Spark Protocol is prohibited (the
      &quot;Prohibited Jurisdictions&quot;).
    </Text>
    <Text type={TEXT_TYPES.BODY} secondary>
      By using or accessing this Interface, the Spark Protocol, or related smart contracts, you represent that you are
      not located in, incorporated or established in, or a citizen or resident of the Prohibited Jurisdictions. You also
      represent that you are not subject to sanctions or otherwise designated on any list of prohibited or restricted
      parties or excluded or denied persons, including but not limited to the lists maintained by the United
      States&apos; Department of Treasury&apos;s Office of Foreign Assets Control, the United Nations Security Council,
      the European Union or its Member States, or any other government authority.
    </Text>
  </>
);
