import React from "react";
import styled from "@emotion/styled";

interface SideBar {
  children: React.ReactNode;
  isShow: boolean;
}

const SideBar: React.FC<SideBar> = ({ children, isShow }) => {
  return (
    <ModalDialog
      className={isShow ? "show" : ""}
      role="document"
    >
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-body">
            <p>{children}</p>
          </div>
        </div>
      </div>
    </ModalDialog>
  );
};

export default SideBar;


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
  -webkit-transition: opacity 0.3s linear, right 0.3s ease-out;
  -moz-transition: opacity 0.3s linear, right 0.3s ease-out;
  -o-transition: opacity 0.3s linear, right 0.3s ease-out;
  transition: opacity 0.3s linear, right 0.3s ease-out;
  z-index: 50;
  border-radius: 16px;

  &.show {
    right: 0px;
  }
`;


