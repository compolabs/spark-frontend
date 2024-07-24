import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import { ModalEnums } from "@screens/SwapScreen/enums/modalEnums.tsx";
import ArrowRight from "@src/assets/icons/arrowRight.svg?react";
import CheckCircle from "@src/assets/icons/check-circle.svg?react";
import CloseIcon from "@src/assets/icons/close.svg?react";
import ErrorCircle from "@src/assets/icons/error-circle.svg?react";
import Text, { TEXT_TYPES } from "@src/components/Text";
import TOKEN_LOGOS from "@src/constants/tokenLogos";
import { useMedia } from "@src/hooks/useMedia";
import { media } from "@src/themes/breakpoints";
import { getExplorerLinkByHash } from "@src/utils/getExplorerLink";

type SuccessModalProps = {
  hash: string;
  onClose: () => void;
  transactionInfo: {
    sellToken: string;
    buyToken: string;
    sellAmount: string;
    buyAmount: string;
  };
  typeModal: ModalEnums;
};

export const ActionModal: React.FC<SuccessModalProps> = ({ hash, onClose, transactionInfo, typeModal }) => {
  const media = useMedia();
  const theme = useTheme();
  const { sellToken, buyToken, sellAmount, buyAmount } = transactionInfo;

  const link = getExplorerLinkByHash(hash);

  return (
    <Overlay>
      <Modal>
        <Actions>
          <Text type={TEXT_TYPES.BODY}>I NEED HELP</Text>
          <CloseIcon onClick={onClose} />
        </Actions>
        <ModalContent>
          {typeModal === ModalEnums.Success ? <CheckCircle /> : <ErrorCircle />}
          <Description>
            <ModalTitle color={theme.colors.textPrimary} type={TEXT_TYPES.H}>
              Swap {typeModal === ModalEnums.Success ? "completed" : "declined"}
            </ModalTitle>
            <a href={link} rel="noreferrer noopener" target="_blank">
              <Text color={theme.colors.greenLight} type={TEXT_TYPES.BODY}>
                See in Explorer
              </Text>
            </a>
          </Description>

          <TransactionInfo>
            <img alt={sellToken} src={TOKEN_LOGOS[sellToken]} width="16px" />
            <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
              {sellAmount} {sellToken}
            </Text>
            <ArrowRight />
            <img alt={buyToken} src={TOKEN_LOGOS[buyToken]} width="16px" />
            <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
              {buyAmount} {buyToken}
            </Text>
          </TransactionInfo>
        </ModalContent>
      </Modal>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #93939338;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
`;

const Modal = styled.div`
  background-color: ${({ theme }) => theme.colors.bgPrimary};
  border-radius: 16px;
  width: 460px;
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
  margin: 36px 0 40px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TransactionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ModalTitle = styled(Text)`
  text-align: center;
  font-weight: 400;
  font-size: 24px;
  line-height: 32px;
`;
