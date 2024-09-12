import React from "react";
import { ToastContentProps } from "react-toastify";
import styled from "@emotion/styled";

import CloseIcon from "@src/assets/icons/close.svg?react";
import InfoIcon from "@src/assets/icons/info.svg?react";
import SuccessIcon from "@src/assets/icons/success.svg?react";
import WarningIcon from "@src/assets/icons/warning.svg?react";
import { getExplorerLinkByAddress, getExplorerLinkByHash } from "@src/utils/getExplorerLink";

import { SmartFlex } from "./SmartFlex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "./Text";
import { media } from "@src/themes/breakpoints";

export interface NotificationProps {
  text: React.ReactNode;
  hash?: string;
  address?: string;
  error?: string;
}

interface Props extends ToastContentProps<unknown>, NotificationProps {}

const Toast: React.FC<Props> = ({ text, error, hash, address, toastProps }) => {
  const { type, closeToast } = toastProps;

  let link = null;
  if (hash) {
    link = getExplorerLinkByHash(hash);
  } else if (address) {
    link = getExplorerLinkByAddress(address);
  }

  const Icon = type === "success" ? SuccessIcon : type === "info" ? InfoIcon : WarningIcon;

  const descElement = error ? (
    <ErrorTextContainer>{error}</ErrorTextContainer>
  ) : link ? (
    <a href={link} rel="noreferrer noopener" target="_blank">
      <Text type={TEXT_TYPES.BUTTON}>View on Explorer</Text>
    </a>
  ) : null;

  return (
    <ToastContainer>
      <Icon />
      <Content>
        <Text type={TEXT_TYPES.BUTTON} secondary>
          {text}
        </Text>
        {descElement}
      </Content>
      <CloseIconStyled onClick={closeToast} />
    </ToastContainer>
  );
};

export const createToast = (props: Props) => {
  return <Toast {...props} />;
};

const ToastContainer = styled(SmartFlex)`
  padding: 14px 16px;
  gap: 12px;
  ${media.mobile} {
    width: 100vw;
    height: 54px;
    align-items: center;
  }
`;

const Content = styled(SmartFlex)`
  flex-direction: column;
  flex-grow: 1;

  gap: 4px;
`;

const CloseIconStyled = styled(CloseIcon)`
  height: 16px;
  width: 16px;

  padding: 4px;

  cursor: pointer;
`;

const ErrorTextContainer = styled(SmartFlex)`
  ${TEXT_TYPES_MAP[TEXT_TYPES.BUTTON]}

  color: ${({ theme }) => theme.colors.textSecondary};

  width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
