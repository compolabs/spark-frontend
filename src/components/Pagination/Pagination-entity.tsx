import React from "react";
import { ButtonHTMLAttributes } from "react";
import styled from "@emotion/styled";

import Button from "@components/Button";

export interface PaginationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export const PaginationEntity = ({ selected, disabled, ...props }: PaginationButtonProps) => {
  return <ButtonStyled {...props} disabled={disabled || selected} text />;
};

const ButtonStyled = styled(Button)`
  border: none;
  height: 16px !important;
  width: 16px !important;
  padding: 0px !important;
  box-sizing: content-box;
`;
