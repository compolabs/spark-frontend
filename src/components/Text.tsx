import { css } from "@emotion/react";
import styled from "@emotion/styled";

/*
    Fonts:
    JetBrains Mono 500  = assets/fonts/JetBrainsMono-Medium.ttf
    JetBrains Mono 400  = assets/fonts/JetBrainsMono-Regular.ttf
    Space Grotesk  500  = assets/fonts/SpaceGrotesk-Medium.ttf
    Space Grotesk  400  = assets/fonts/SpaceGrotesk-Regular.ttf
*/

// Desktop (base)
const H = `
  font-family: "JetBrains Mono";
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px;
`;

const BODY = `
  font-family: "JetBrains Mono";
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 14px;
  letter-spacing: 0.24px;
`;

const BUTTON = `
  font-family: "Space Grotesk";
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
`;

const BUTTON_SECONDARY = `
  font-family: "Space Grotesk";
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
  text-transform: uppercase;
`;

const SUPPORTING = `
  font-family: "Space Grotesk";
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 12px;
  letter-spacing: 0.24px;
`;

const SUPPORTING_NUMBERS = `
  font-family: "JetBrains Mono";
  font-size: 11px;
  font-style: normal;
  font-weight: 400;
  line-height: 11px;
  letter-spacing: 0.22px;
`;

// Desktop (+added)
const H_NUMBERS = `
  font-family: "JetBrains Mono";
  font-size: 24px;
  font-style: normal;
  font-weight: 400;
  line-height: 32px;
  letter-spacing: 0.48px;
`;

const H_TEXT = `
  font-family: "Space Grotesk";
  font-size: 24px;
  font-style: normal;
  font-weight: 400;
  line-height: 32px;
`;

const BUTTON_BIG = `
  font-family: "Space Grotesk";
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
`;

const TEXT_BIG = `
  font-family: "Space Grotesk";
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
`;

const TEXT = `
  font-family: "Space Grotesk";
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
`;

const CP_Header_18_Medium = `
  font-family: Chakra Petch;
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  letter-spacing: 3%;
`;

const CP_Button_14_Medium = `
  font-family: Chakra Petch;
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  letter-spacing: 2%;
`;

const CP_Body_16_Medium = `
  font-family: Chakra Petch;
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  letter-spacing: 2%;
`;

const CP_Support_10 = `
  font-family: Chakra Petch;
  font-weight: 500;
  font-size: 10px;
  line-height: 14px;
  letter-spacing: 4%;
`;

export const TEXT_TYPES_MAP = {
  H,
  BODY,
  BUTTON,
  BUTTON_SECONDARY,
  SUPPORTING,
  SUPPORTING_NUMBERS,
  H_NUMBERS,
  H_TEXT,
  BUTTON_BIG,
  TEXT_BIG,
  TEXT,
  CP_Header_18_Medium,
  CP_Button_14_Medium,
  CP_Body_16_Medium,
  CP_Support_10,
};

type TEXT_TYPES = keyof typeof TEXT_TYPES_MAP;

interface TextProps {
  type?: TEXT_TYPES;
  uppercase?: boolean;
  primary?: boolean;
  secondary?: boolean;
  disabled?: boolean;
  color?: string;
  nowrap?: boolean;
  pointer?: boolean;
  greenLight?: boolean;
  attention?: boolean;
}

const Text = styled.div<TextProps>`
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
  ${({ type }) => (type ? TEXT_TYPES_MAP[type] : TEXT_TYPES_MAP.BODY)}
  ${({ uppercase }) => uppercase && "text-transform: uppercase;"}
  cursor: ${({ pointer }) => (pointer ? "pointer" : "inherit")}
`;
export default Text;
