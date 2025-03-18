import React from "react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";

import { TEXT_TYPES_MAP } from "@components/Text";

import search from "@assets/icons/search.svg";

import Input from "./Input";

interface WrapProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  variant?: "default" | "transparent";
}

const Wrap = styled.div<{ variant: WrapProps["variant"] }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  gap: 8px;

  ${({ theme, variant }) => {
    switch (variant) {
      case "transparent":
        return css`
          height: 40px;
          border-bottom: 1px solid ${theme.colors.textDisabled};
          padding: 4px;
          &:hover {
            border-bottom: 1px solid ${theme.colors.textPrimary};
          }
          &:focus-within {
            border-bottom: 1px solid ${theme.colors.textPrimary};
          }

          input {
            ${TEXT_TYPES_MAP.TEXT}
          }
        `;
      case "default":
      default:
        return css`
          border-radius: 4px;
          border: 1px solid ${theme.colors.borderSecondary};
          background: ${theme.colors.bgPrimary};
          height: 32px;
          padding: 4px 8px;

          input {
            ${TEXT_TYPES_MAP.BODY}
          }
        `;
    }
  }}
`;

const SearchInput: React.FC<WrapProps> = ({ value, onChange, placeholder, variant = "default" }) => {
  return (
    <Wrap variant={variant}>
      <img alt="search" src={search} width={24} />
      <Input
        placeholder={placeholder ? placeholder : "Search by name..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Wrap>
  );
};
export default SearchInput;
