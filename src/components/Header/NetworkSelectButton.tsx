import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import arrowIcon from "@src/assets/icons/arrowUp.svg";
import { media } from "@src/themes/breakpoints";

import { SmartFlex } from "../SmartFlex";
import { TEXT_TYPES, TEXT_TYPES_MAP } from "../Text";

import { ActiveNetwork } from "./ActiveNetwork";

interface Props {
  isSmall?: boolean;
  isFocused?: boolean;
  className?: string;
  onClick?: () => void;
}

const NetworkSelectButton: React.FC<Props> = observer(({ isSmall, isFocused, className, onClick }) => {
  return (
    <Root className={className} gap={isSmall ? "0" : "8px"} isFocused={isFocused} center onClick={onClick}>
      <ActiveNetwork hasTitle={!isSmall} />
      <ArrowIconStyled alt="Arrow Icon" src={arrowIcon} />
    </Root>
  );
});

export default NetworkSelectButton;

const ArrowIconStyled = styled.img`
  transition: 0.4s;
`;

const Root = styled(SmartFlex)<{
  isFocused?: boolean;
}>`
  background: transparent;
  padding: 4px 8px;
  color: ${({ theme }) => theme.colors.textPrimary};
  ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]};
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
  border-radius: 32px;
  height: 40px;

  ${media.mobile} {
    padding: 8px 8px;
  }

  transition: border 400ms;

  cursor: pointer;

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
