import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { motion } from "framer-motion";

import { IAssetBlock } from "@components/SelectAssets/AssetBlock";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import CheckCircle from "@assets/icons/check-circle.svg?react";
import CloseIcon from "@assets/icons/close.svg?react";
import ErrorCircle from "@assets/icons/error-circle.svg?react";
import Spinner from "@assets/icons/spinner.svg?react";

import { ModalEnums, TypeTransaction } from "@screens/Assets/enums/actionEnums";

import TOKEN_LOGOS from "@constants/tokenLogos";
import { getExplorerLinkByHash } from "@utils/getExplorerLink";

export type ActionModal = {
  hash: string;
  transactionInfo: {
    token: IAssetBlock["token"];
    type: TypeTransaction;
    amount: string;
  };
  typeModal: ModalEnums;
};

interface ActionModalProps extends ActionModal {
  onClose: () => void;
}

const iconTitle = (type: ModalEnums) => {
  switch (type) {
    case ModalEnums.Pending:
      return <Spinner />;
    case ModalEnums.Success:
      return <CheckCircle />;
    case ModalEnums.Error:
      return <ErrorCircle />;
  }
};

export const ActionModal: React.FC<ActionModalProps> = ({ hash, onClose, transactionInfo, typeModal }) => {
  const theme = useTheme();
  const { token, type, amount } = transactionInfo;

  const descriptionAction = (type: ModalEnums, link: string, transactionType: string) => {
    switch (type) {
      case ModalEnums.Pending:
        return "Approve transaction in your wallet";
      case ModalEnums.Success:
        return (
          <SmartFlex alignItems="center" gap="2px" justifyContent="center" column>
            Assets deposited
            <a href={link} rel="noreferrer noopener" target="_blank">
              <Text color={theme.colors.greenLight} type={TEXT_TYPES.BODY}>
                See in Explorer
              </Text>
            </a>
          </SmartFlex>
        );
      case ModalEnums.Error:
        return transactionType + " failed";
    }
  };
  const link = getExplorerLinkByHash(hash);

  return (
    <Overlay>
      <Modal
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        initial={{ y: "100%" }}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "20px",
          zIndex: 1000,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <ModalContent>
          <ActionBlock alignItems="center" gap="30px" justifyContent="center" column>
            <Actions>
              <CloseIcon onClick={onClose} />
            </Actions>
            {iconTitle(typeModal)}
            <Description>
              <ModalTitle color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON}>
                {descriptionAction(typeModal, link, transactionInfo.type)}
              </ModalTitle>
            </Description>
          </ActionBlock>

          <SmartFlex alignItems="center" gap="20px" justifyContent="center">
            <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON}>
              {type}
            </Text>
            <SmartFlex alignItems="center" gap="5px" justifyContent="center">
              <img alt={token.asset.symbol} src={TOKEN_LOGOS[token.asset.symbol]} width="16px" />
              <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
                {amount} {token.asset.symbol}
              </Text>
            </SmartFlex>
          </SmartFlex>
        </ModalContent>
      </Modal>
    </Overlay>
  );
};

const ActionBlock = styled(SmartFlex)`
  height: 100%;
`;
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
`;

const Modal = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 16px;
  width: 100%;
  height: 309px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  ${media.mobile} {
    width: calc(100% - 30px);
    margin: 0 auto;
  }
`;

const ModalContent = styled.div`
  text-align: center;
  gap: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`;

const Actions = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 16px;

  svg,
  div {
    cursor: pointer;
  }
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
`;

const ModalTitle = styled(Text)`
  text-align: center;
  width: 148px;
  line-height: 20px;
`;
