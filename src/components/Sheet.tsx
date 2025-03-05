import React from "react";
import SheetModal from "react-modal-sheet";
import { SheetProps } from "react-modal-sheet/dist/types";

interface SheetOwnProps {
  header?: boolean;
}

const Sheet: React.FC<SheetProps & SheetOwnProps> = ({ children, header, detent = "content-height", ...rest }) => {
  return (
    <SheetModal {...rest} detent={detent}>
      <SheetModal.Container>
        {header && <SheetModal.Header />}
        <SheetModal.Content>{children}</SheetModal.Content>
      </SheetModal.Container>
      <SheetModal.Backdrop onTap={rest.onClose} />
    </SheetModal>
  );
};

export default Sheet;
