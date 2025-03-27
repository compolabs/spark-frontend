import React from "react";

import Button, { ButtonProps } from "@components/Button.tsx";

export interface ButtonWrapperProps extends ButtonProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  "data-testid"?: "terms.dropdown.trigger";
}

const ButtonWrapper: React.FC<ButtonWrapperProps & { children?: React.ReactNode }> = ({
  "data-testid": testId,
  ...props
}) => {
  return <Button data-testid={testId} {...props} />;
};

export default ButtonWrapper;
