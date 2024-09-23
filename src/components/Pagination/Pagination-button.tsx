import React, { ButtonHTMLAttributes } from "react";
import styled from "@emotion/styled";

import Button from "@components/Button";

export interface PaginationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const PaginationButton = ({ ...props }: PaginationButtonProps) => {
  return <ButtonStyled {...props} grey />;
};

const ButtonStyled = styled(Button)`
  background-color: #232323;
  border: none;
  border-radius: 8px;
  height: 16px !important;
  width: 16px !important;
  padding: 4px !important;
  box-sizing: content-box;
`;
