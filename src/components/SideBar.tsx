import React from "react";
import styled from "@emotion/styled";

interface SideBar {
  children: React.ReactNode;
  isShow: boolean;
  onClose: () => void;
}

const SideBar: React.FC<SideBar> = ({ children, isShow, onClose }) => {
  return (
    <>
      {isShow && <Backdrop onClick={onClose} />}
      <ModalDialog className={isShow ? "show" : ""} role="document">
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
  z-index: 2;
`;
const ModalDialog = styled.div`
  padding: 16px;
  backdrop-filter: blur(20px);
  background-color: rgba(34, 34, 34, 0.3);
  position: fixed;
  display: block;
  top: 0;
  bottom: 0;
  right: -340px;
  width: 320px;
  margin: 10px;
  -webkit-transition:
    opacity 0.3s linear,
    right 0.3s ease-out;
  -moz-transition:
    opacity 0.3s linear,
    right 0.3s ease-out;
  -o-transition:
    opacity 0.3s linear,
    right 0.3s ease-out;
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
