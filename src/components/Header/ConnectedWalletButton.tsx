import React from "react";
import styled from "@emotion/styled";
import { useDisconnect } from "@fuels/react";
import { observer } from "mobx-react";

import arrowIcon from "@src/assets/icons/arrowUp.svg";
import { useWallet } from "@src/hooks/useWallet";
import { useStores } from "@src/stores";
import centerEllipsis from "@src/utils/centerEllipsis";

import { SmartFlex } from "../SmartFlex";
import { TEXT_TYPES, TEXT_TYPES_MAP } from "../Text";

interface Props {
  isFocused?: boolean;
  className?: string;
  onClick?: () => void;
}

const ConnectedWalletButton: React.FC<Props> = observer(({ isFocused, className, onClick }) => {
  const { accountStore } = useStores();
  const { address } = useWallet();
  const { disconnect } = useDisconnect();

  return (
    <Root className={className} gap="8px" isFocused={isFocused} center onClick={onClick}>
      {centerEllipsis(address ?? "", 10)}
      <ArrowIconStyled alt="Arrow Icon" src={arrowIcon} />
    </Root>
  );
});

export default ConnectedWalletButton;

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
  ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]};
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
