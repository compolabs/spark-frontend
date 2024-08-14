import React from "react";
import Sheet from "react-modal-sheet";
import styled from "@emotion/styled";

interface ModalSheet {
  children: React.ReactNode;
  isVisible: boolean;
  onClose: () => void;
}

const ModalSheet = ({ children, isVisible, onClose }: ModalSheet) => {
  return (
    <Sheet initialSnap={0} isOpen={isVisible} snapPoints={[400, 100, 0]} onClose={onClose}>
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
`;
