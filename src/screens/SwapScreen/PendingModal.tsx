import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import ArrowRight from "@src/assets/icons/arrowRight.svg?react";
import CloseIcon from "@src/assets/icons/close.svg?react";
import Spinner from "@src/assets/icons/spinner.svg?react";
import Text, { TEXT_TYPES } from "@src/components/Text";
import TOKEN_LOGOS from "@src/constants/tokenLogos";
import { media } from "@src/themes/breakpoints";

type PendingModalProps = {
  onClose: () => void;
  transactionInfo: {
    sellToken: string;
    buyToken: string;
    sellAmount: string;
    buyAmount: string;
  };
};

export const PendingModal: React.FC<PendingModalProps> = ({ onClose, transactionInfo }) => {
  const theme = useTheme();
  const { sellToken, buyToken, sellAmount, buyAmount } = transactionInfo;

  return (
    <Overlay>
      <Modal>
        <Actions>
          <a href="https://discord.com/invite/rsZnUY3kgm" rel="noreferrer" target="_blank">
            <Text type={TEXT_TYPES.BODY}>I NEED HELP</Text>
          </a>
          <CloseIcon onClick={onClose} />
        </Actions>
        <ModalContent>
          <Spinner />
          <Description>
            <ModalTitle color={theme.colors.textPrimary} type={TEXT_TYPES.H}>
              Approve transaction in your wallet
            </ModalTitle>
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

const ModalTitle = styled(Text)`
  text-align: center;
  font-weight: 400;
  max-width: 70%;
  margin: 0 auto;
  font-size: 24px;
  line-height: 32px;
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
  justify-content: center;
  gap: 6px;
`;
