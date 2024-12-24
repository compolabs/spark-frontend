import React from "react";
import styled from "@emotion/styled";

interface SideBar {
  children: React.ReactNode;
  isVisible: boolean;
  onClose: () => void;
}

const SideBar: React.FC<SideBar> = ({ children, isVisible, onClose }) => {
  return (
    <>
      {isVisible && <Backdrop onClick={onClose} />}
      <ModalDialog className={isVisible ? "show" : ""} role="document">
        <div style={{ position: "relative", height: "100%" }}>{children}</div>
      </ModalDialog>
    </>
  );
};

export default SideBar;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  z-index: 3;
`;
const ModalDialog = styled.div`
  position: fixed;
  padding: 20px;
  backdrop-filter: blur(20px);
  background-color: #222222;
  display: block;
  top: 0;
  bottom: 0;
  right: -380px;
  width: 360px;
  margin: 20px;
  transition:
    opacity 0.3s linear,
    right 0.3s ease-out;
  z-index: 3;
  border-radius: 16px;
  overflow-x: hidden;
  overflow-y: auto;

  &.show {
    right: 0px;
  }
`;
