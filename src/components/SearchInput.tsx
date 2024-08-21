import React from "react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";

import { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import search from "@src/assets/icons/search.svg";

import Input from "./Input";

interface IProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  variant?: "default" | "transparent";
}

const Wrap = styled.div<{ variant: IProps["variant"] }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  ${({ theme, variant }) => {
    switch (variant) {
      case "transparent":
        return css`
          height: 40px;
          border-bottom: 1px solid ${theme.colors.textSecondary};
          padding: 4px;

          input {
            ${TEXT_TYPES_MAP[TEXT_TYPES.INFO]}
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
            ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}
          }
        `;
    }
  }}
`;

const SearchInput: React.FC<IProps> = ({ value, onChange, placeholder, variant = "default" }) => {
  return (
    <Wrap variant={variant}>
      <img alt="search" src={search} />
      <Input
        placeholder={placeholder ? placeholder : "Search by name..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Wrap>
  );
};
export default SearchInput;
