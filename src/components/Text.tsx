import { css } from "@emotion/react";
import styled from "@emotion/styled";

/*
    Fonts:

    JetBrains Mono 500  = assets/fonts/JetBrainsMono-Medium.ttf
    JetBrains Mono 400  = assets/fonts/JetBrainsMono-Regular.ttf
    Space Grotesk  500  = assets/fonts/SpaceGrotesk-Medium.ttf
    Space Grotesk  400  = assets/fonts/SpaceGrotesk-Regular.ttf
*/

export enum TEXT_TYPES {
  H = 2,
  BODY = 3,
  BUTTON = 4,
  BUTTON_SECONDARY = 5,
  SUPPORTING = 6,
  SUPPORTING_NUMBERS = 7,
  H_NUMBERS = 8,
  H_TEXT = 9,
  BUTTON_BIG = 10,
  TEXT_BIG = 11,
  TEXT = 12,
}

interface IProps {
  type?: TEXT_TYPES;
  primary?: boolean;
  secondary?: boolean;
  disabled?: boolean;
  color?: string;
  nowrap?: boolean;
  pointer?: boolean;
  greenLight?: boolean;
  attention?: boolean;
}

// Desktop (base)
export const h = `
  font-family: "JetBrains Mono";
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px;
`;

export const body = `
  font-family: "JetBrains Mono";
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 14px;
  letter-spacing: 0.24px;
`;

export const button = `
  font-family: "Space Grotesk";
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
`;

export const buttonSecondary = `
  font-family: "Space Grotesk";
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
  text-transform: uppercase;
`;

export const supportingText = `
  font-family: "Space Grotesk";
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 12px;
  letter-spacing: 0.24px;
`;

export const supportingNumbers = `
  font-family: "JetBrains Mono";
  font-size: 11px;
  font-style: normal;
  font-weight: 400;
  line-height: 11px;
  letter-spacing: 0.22px;
`;

// Desktop (+added)
export const hNumbers = `
  font-family: "JetBrains Mono";
  font-size: 24px;
  font-style: normal;
  font-weight: 400;
  line-height: 32px;
  letter-spacing: 0.48px;
`;

export const hText = `
  font-family: "Space Grotesk";
  font-size: 24px;
  font-style: normal;
  font-weight: 400;
  line-height: 32px;
`;

export const buttonBig = `
  font-family: "Space Grotesk";
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
`;

export const textBig = `
  font-family: "Space Grotesk";
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
`;

export const text = `
  font-family: "Space Grotesk";
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
`;

export const TEXT_TYPES_MAP = {
  [TEXT_TYPES.H]: h,
  [TEXT_TYPES.BODY]: body,
  [TEXT_TYPES.BUTTON]: button,
  [TEXT_TYPES.BUTTON_SECONDARY]: buttonSecondary,
  [TEXT_TYPES.SUPPORTING]: supportingText,
  [TEXT_TYPES.SUPPORTING_NUMBERS]: supportingNumbers,
  [TEXT_TYPES.H_NUMBERS]: hNumbers,
  [TEXT_TYPES.H_TEXT]: hText,
  [TEXT_TYPES.BUTTON_BIG]: buttonBig,
  [TEXT_TYPES.TEXT_BIG]: textBig,
  [TEXT_TYPES.TEXT]: text,
};

const Text = styled.div<IProps>`
  white-space: ${({ nowrap }) => (nowrap ? "nowrap" : "normal")};
  ${({ attention, primary, secondary, greenLight, disabled, theme, color }) =>
    (() => {
      switch (true) {
        case attention:
          return css`
            color: ${theme.colors?.attention};
          `;
        case greenLight:
          return css`
            color: ${theme.colors?.greenLight};
          `;
        case primary:
          return css`
            color: ${theme.colors?.textPrimary};
          `;
        case secondary:
          return css`
            color: ${theme.colors?.textSecondary};
          `;
        case disabled:
          return css`
            color: ${theme.colors?.textDisabled};
          `;
        default:
          return css`
            color: ${color ?? theme.colors?.textSecondary};
          `;
      }
    })()}
  ${({ type }) => (type ? TEXT_TYPES_MAP[type] : TEXT_TYPES_MAP[TEXT_TYPES.BODY])}
	cursor: ${({ pointer }) => (pointer ? "pointer" : "inherit")}
`;
export default Text;
