import { css } from "@emotion/react";
import styled from "@emotion/styled";

import { media } from "@src/themes/breakpoints";

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

export const hStyle = `
font-family: JetBrains Mono;
font-size: 18px;
font-style: normal;
font-weight: 500;
line-height: 18px;
${media.mobile} {
  font-size: 14px;
  line-height: 16px;
}
`;

export const bodyStyle = `
font-family: JetBrains Mono;
font-size: 12px;
font-style: normal;
font-weight: 400;
line-height: 14px;
letter-spacing: 0.2px;
${media.mobile} {
  font-size: 10px;
}
`;

export const buttonStyle = `
font-family: Space Grotesk;
font-size: 14px;
font-style: normal;
font-weight: 500;
line-height: 16px;
${media.mobile} {
  font-size: 12px;
}
`;

export const buttonSecondaryStyle = `
font-family: Space Grotesk;
font-size: 12px;
font-style: normal;
font-weight: 500;
line-height: 16px; 
text-transform: uppercase;
${media.mobile} {
  font-size: 10px;
}
`;

export const supportStyle = `
font-family: Space Grotesk;
font-size: 12px;
font-style: normal;
font-weight: 400;
line-height: 12px; 
letter-spacing: 0.2px;
${media.mobile} {
  font-size: 10px;
  line-height: 10px;
}
`;

export const supportNumbersStyle = `
font-family: Space Grotesk;
font-size: 11px;
font-style: normal;
font-weight: 400;
line-height: 11px; 
letter-spacing: 0.2px;
${media.mobile} {
  font-size: 9px;
  line-height: 9px;
}
`;

export const TEXT_TYPES_MAP = {
  [TEXT_TYPES.H]: hStyle,
  [TEXT_TYPES.BODY]: bodyStyle,
  [TEXT_TYPES.BUTTON]: buttonStyle,
  [TEXT_TYPES.BUTTON_SECONDARY]: buttonSecondaryStyle,
  [TEXT_TYPES.SUPPORTING]: supportStyle,
  [TEXT_TYPES.SUPPORTING_NUMBERS]: supportNumbersStyle,
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
