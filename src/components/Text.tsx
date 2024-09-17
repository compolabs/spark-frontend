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
  H = 1,
  BODY = 2,
  BUTTON = 3,
  BUTTON_SECONDARY = 4,
  SUPPORTING = 5,
  SUPPORTING_NUMBERS = 6,
  TITLE = 7,
  TITLE_MODAL = 8,
  INFO = 9,
  H_NEW = 10,
  BODY_NEW = 11,
  BUTTON_NEW = 12,
  BUTTON_SECONDARY_NEW = 13,
  SUPPORTING_TEXT_NEW = 14,
  SUPPORTING_NUMBERS_NEW = 15,
  H_NUMBERS_NEW = 16,
  H_TEXT_NEW = 17,
  BUTTON_BIG_NEW = 18,
  TEXT_BIG_NEW = 19,
  TEXT_NEW = 20,
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

export const textNew = `
  font-family: "Space Grotesk";
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
`;

// TODO: это старые стили их нужно будет удалить
export const titleStyle = `
  font-family: Space Grotesk;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: 14px;
`;

export const titleModalStyle = `
  font-family: Space Grotesk;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 14px;
`;

export const hStyle = `
  font-family: JetBrains Mono;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px;
`;

export const bodyStyle = `
  font-family: JetBrains Mono;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 14px;
  letter-spacing: 0.2px;
`;

export const infoStyle = `
  font-family: JetBrains Mono;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
`;

export const buttonStyle = `
  font-family: Space Grotesk;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
`;

export const buttonSecondaryStyle = `
  font-family: Space Grotesk;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px; 
  text-transform: uppercase;
`;

export const supportStyle = `
  font-family: Space Grotesk;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 12px; 
  letter-spacing: 0.2px;
`;

export const supportNumbersStyle = `
  font-family: Space Grotesk;
  font-size: 11px;
  font-style: normal;
  font-weight: 400;
  line-height: 11px; 
  letter-spacing: 0.2px;
`;

export const TEXT_TYPES_MAP = {
  [TEXT_TYPES.H]: hStyle,
  [TEXT_TYPES.BODY]: bodyStyle,
  [TEXT_TYPES.BUTTON]: buttonStyle,
  [TEXT_TYPES.BUTTON_SECONDARY]: buttonSecondaryStyle,
  [TEXT_TYPES.SUPPORTING]: supportStyle,
  [TEXT_TYPES.SUPPORTING_NUMBERS]: supportNumbersStyle,
  [TEXT_TYPES.TITLE]: titleStyle,
  [TEXT_TYPES.TITLE_MODAL]: titleModalStyle,
  [TEXT_TYPES.INFO]: infoStyle,
  [TEXT_TYPES.H_NEW]: h,
  [TEXT_TYPES.BODY_NEW]: body,
  [TEXT_TYPES.BUTTON_NEW]: button,
  [TEXT_TYPES.BUTTON_SECONDARY_NEW]: buttonSecondary,
  [TEXT_TYPES.SUPPORTING_TEXT_NEW]: supportingText,
  [TEXT_TYPES.SUPPORTING_NUMBERS_NEW]: supportingNumbers,
  [TEXT_TYPES.H_NUMBERS_NEW]: hNumbers,
  [TEXT_TYPES.H_TEXT_NEW]: hText,
  [TEXT_TYPES.BUTTON_BIG_NEW]: buttonBig,
  [TEXT_TYPES.TEXT_BIG_NEW]: textBig,
  [TEXT_TYPES.TEXT_NEW]: textNew,
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
