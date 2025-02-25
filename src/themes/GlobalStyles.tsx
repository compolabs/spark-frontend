import React from "react";
import { css, Global, Theme, useTheme } from "@emotion/react";

const globalModalStyles = (theme: Theme) => css`
  // #root {
  //   filter: invert(1);
  // }

  * {
    box-sizing: border-box;
  }

  a {
    text-decoration: none;
  }

  // BEGIN rc-dialog
  .rc-dialog-mask {
    background: rgba(5, 5, 5, 0.5);
    backdrop-filter: blur(5px);
  }

  .rc-dialog-wrap {
    flex-direction: column;
    align-items: center;
    display: flex;
    justify-content: center;
  }

  .rc-dialog {
    margin: 0;
    width: 100%;
    max-width: 414px;
    background: ${theme.colors.bgSecondary};
    border: 1px solid ${theme.colors.strokeSecondary};
  }

  .rc-dialog-content {
    border-radius: 10px;
    background: ${theme.colors.bgSecondary};
    height: 100%;
  }

  .rc-dialog-body {
    padding: 0;
    box-sizing: border-box;
    height: 100%;
    // use direct child selector to set styles for the 3rd party library div
    > div {
      height: 100%;
    }
  }

  .rc-dialog-header {
    padding: unset;
    background: ${theme.colors.bgSecondary};
    color: ${theme.colors.textPrimary};
    border: none;
  }

  .rc-dialog-close {
    opacity: 1;
    top: 8px;
    right: 8px;
    width: 40px;
    height: 40px;
    display: none;
  }

  @media (min-width: 400px) {
    .rc-dialog-close {
      right: 0;
    }
  }
  // END rc-dialog

  // BEGIN react-modal-sheet
  .react-modal-sheet-backdrop {
    background: rgba(5, 5, 5, 0.5);
    backdrop-filter: blur(5px);
  }

  .react-modal-sheet-container {
    border-radius: 0 !important;

    background-color: ${theme.colors.fillSurface} !important;
    border: 1px solid ${theme.colors.strokePrimary} !important;
  }

  .react-modal-sheet-drag-indicator {
    background-color: ${theme.colors.iconSecondary} !important;
  }
  // END react-modal-sheet

  // BEGIN Toastify
  .Toastify__toast-container {
    padding: 0;
    min-height: unset;
    width: fit-content;
  }
  .Toastify__toast {
    padding: 0;
    margin: 0 0 8px 0;
    border-radius: 8px;
    min-height: unset;

    box-shadow:
      0px 4px 4px 0px #00000026,
      0px 12px 22px 0px #00000047;
  }

  .Toastify__toast-body {
    padding: 0;
    align-items: stretch;
    background-color: ${theme.colors.borderSecondary};
  }

  .Toastify__toast-icon {
    display: none;
  }
  // END Toast
`;

const GlobalStyles: React.FC = () => {
  const theme = useTheme();

  return <Global styles={globalModalStyles(theme)} />;
};

export default GlobalStyles;
