import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import arrowIcon from "@assets/icons/arrowUp.svg";

import { useStores } from "@stores";
import { MIXPANEL_EVENTS } from "@stores/MixPanelStore";

import { getShortString } from "@utils/getShortString";

import { SmartFlex } from "../SmartFlex";
import { TEXT_TYPES_MAP } from "../Text";

interface Props {
  isFocused?: boolean;
  className?: string;
  onClick?: () => void;
}

const WalletAddressButton: React.FC<Props> = observer(({ isFocused, className, onClick }) => {
  const { accountStore, mixPanelStore } = useStores();

  const handleWalletClick = () => {
    mixPanelStore.trackEvent(MIXPANEL_EVENTS.WALLET_CONNECTED, {
      page_name: location.pathname,
      user_address: accountStore.address,
    });

    onClick?.();
  };

  return (
    <Root className={className} gap="8px" isFocused={isFocused} center onClick={handleWalletClick}>
      {getShortString(accountStore.address ?? "", 10)}
      <ArrowIconStyled alt="Arrow Icon" src={arrowIcon} />
    </Root>
  );
});

export default WalletAddressButton;

const ArrowIconStyled = styled.img`
  transition: 0.4s;
`;

const Root = styled(SmartFlex)<{
  isFocused?: boolean;
}>`
  background: transparent;
  padding: 4px 8px;
  height: 40px;
  color: ${({ theme }) => theme.colors.textPrimary};
  ${TEXT_TYPES_MAP.BODY};
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
  border-radius: 32px;

  transition: border 400ms;

  ${ArrowIconStyled} {
    transform: ${({ isFocused }) => (isFocused ? "rotate(-180deg)" : "rotate(0)")};
  }

  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.borderAccent};

    ${ArrowIconStyled} {
      transform: ${({ isFocused }) => (isFocused ? "rotate(-180deg)" : "rotate(-90deg)")};
    }
  }
`;
