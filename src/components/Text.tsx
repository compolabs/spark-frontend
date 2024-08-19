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
}

interface IProps {
  type?: TEXT_TYPES;
  primary?: boolean;
  secondary?: boolean;
  disabled?: boolean;
  color?: string;
  nowrap?: boolean;
  pointer?: boolean;
}

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
};

const Text = styled.div<IProps>`
  white-space: ${({ nowrap }) => (nowrap ? "nowrap" : "normal")};
  ${({ primary, secondary, disabled, theme, color }) =>
    (() => {
      switch (true) {
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
