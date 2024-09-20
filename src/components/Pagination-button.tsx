import styled from "@emotion/styled";
import React from "react";
import { ButtonHTMLAttributes } from "react";

export interface PaginationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export const PaginationButton = ({ selected, disabled, className, ...props }: PaginationButtonProps) => {
  return <ButtonStyled {...props} disabled={disabled} type="button" />;
};

const ButtonStyled = styled.button`
  background-color: #232323;
  border: none;
  border-radius: 8px;
`;
