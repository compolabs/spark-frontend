import React, { ChangeEvent } from "react";
import styled from "@emotion/styled";

interface InputProps
  extends Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "onChange"> {
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  input {
    padding: 0;
    width: 100%;
    outline: none;
    border: none;
    background-color: transparent;

    color: ${({ theme }) => theme.colors.textPrimary};

    ::placeholder {
      color: ${({ theme }) => theme.colors.textSecondary};
    }
  }
`;

const Input: React.FC<InputProps> = ({ value, onChange, placeholder, disabled, ...rest }) => {
  return (
    <>
      <Root {...rest}>
        <input disabled={disabled} placeholder={placeholder} value={value} onChange={onChange} />
      </Root>
    </>
  );
};
export default Input;
