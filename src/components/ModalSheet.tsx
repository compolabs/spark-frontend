import React, { useRef, useState } from "react";
import Sheet from "react-modal-sheet";
import styled from "@emotion/styled";

interface ModalSheet {
  children: React.ReactNode;
  isShow: boolean;
  onClose: () => void
}

const ModalSheet = ({ children, isShow, onClose }: ModalSheet) => {
  return (
    <Sheet initialSnap={1} isOpen={isShow} onClose={onClose}>
      <SheetContainer>
        <Sheet.Content>{children}</Sheet.Content>
      </SheetContainer>
    </Sheet>
  );
};

export default ModalSheet;

const SheetContainer = styled(Sheet.Container)`
  padding: 10px;
  overflow: auto;
`
