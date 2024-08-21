import React, { useEffect, useRef, useState } from "react";
import Sheet from "react-modal-sheet";
import styled from "@emotion/styled";

interface ModalSheet {
  children: React.ReactNode;
  isVisible: boolean;
  onClose: () => void;
}

const ModalSheet = ({ children, isVisible, onClose }: ModalSheet) => {
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children]);

  return (
    <Sheet initialSnap={0} isOpen={isVisible} snapPoints={[contentHeight, 100, 0]} onClose={onClose}>
      <SheetContainer>
        <Sheet.Content ref={contentRef}>{children}</Sheet.Content>
      </SheetContainer>
    </Sheet>
  );
};

export default ModalSheet;

const SheetContainer = styled(Sheet.Container)`
  padding: 10px;
  overflow: auto;
`;
