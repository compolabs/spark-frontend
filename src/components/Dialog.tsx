import React, { useCallback, useRef } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import RcDialog, { DialogProps } from "rc-dialog";

import CloseIcon from "@assets/icons/close.svg?react";

import { useOnClickOutside } from "@hooks/useOnClickOutside";

export const Dialog: React.FC<DialogProps> = observer(({ children, ...rest }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleCloseDialog = useCallback(() => {
    rest.onClose !== undefined && rest.onClose(null as any);
  }, [rest.onClose]);

  useOnClickOutside(dialogRef, handleCloseDialog);

  return (
    <RcDialog animation="zoom" closeIcon={<CloseIconStyled />} maskAnimation="fade" {...rest}>
      <div ref={dialogRef}>{children}</div>
    </RcDialog>
  );
});

const CloseIconStyled = styled(CloseIcon)`
  width: 14px;
  height: 14px;

  path {
    fill: ${({ theme }) => theme.colors.textIconPrimary};
  }

  //cursor: pointer;
`;
