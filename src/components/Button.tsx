import { css } from "@emotion/react";
import styled from "@emotion/styled";

import { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { media } from "@src/themes/breakpoints";

const Button = styled.button<{
  green?: boolean;
  red?: boolean;
  text?: boolean;
  fitContent?: boolean;
  //этот active и &:active отлтчаются: это состояние нажатой кнопки, а &:active - это цвеь в момент нажатия
  active?: boolean;
}>`
  text-decoration: none;
  white-space: nowrap;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  ${TEXT_TYPES_MAP[TEXT_TYPES.BUTTON]}
  height: 40px;
  padding: 0 16px;
  border-radius: 32px;
  cursor: pointer;
  background: transparent;
  transition: 0.4s;
  width: ${({ fitContent }) => (fitContent ? "fit-content" : "100%")};
  color: ${({ theme }) => theme.colors.textPrimary};

  ${media.desktop} {
    padding: 0 12px;
    height: 40px;
  }

  ${({ green, red, text, theme, active }) =>
    (() => {
      switch (true) {
        case green:
          return css`
            border: 1px solid ${theme.colors.greenLight};
            background: ${active ? theme.colors.greenMedium : theme.colors.greenDark};

            &:hover {
              background: ${theme.colors.greenMedium};
            }

            &:active {
              background: ${theme.colors.greenDark};
            }

            &:disabled {
              border-color: ${theme.colors.textDisabled};
              background: ${theme.colors.borderSecondary};
              color: ${theme.colors.textSecondary};
            }
          `;
        case red:
          return css`
            border: 1px solid ${theme.colors.redLight};
            background: ${active ? theme.colors.redMedium : theme.colors.redDark};

            &:hover {
              background: ${theme.colors.redMedium};
            }

            &:active {
              background: ${theme.colors.redDark};
            }

            &:disabled {
              border-color: ${theme.colors.borderSecondary};
              background: ${theme.colors.borderSecondary};
              color: ${theme.colors.textDisabled};
            }
          `;
        case text:
          return css`
            color: ${active ? theme.colors.textPrimary : theme.colors.textSecondary};
            border: 0;

            &:hover {
              color: ${theme.colors.textPrimary};
            }

            &:active {
              color: ${theme.colors.textPrimary};
            }

            &:disabled {
              color: ${theme.colors.textDisabled};
            }
          `;
        default:
          return css`
            border: 1px solid ${active ? theme.colors.borderAccent : theme.colors.borderPrimary};
            color: ${active ? theme.colors.textPrimary : theme.colors.textSecondary};

            &:hover {
              border: 1px solid ${theme.colors.borderAccent};
              color: ${theme.colors.textPrimary};
            }

            &:active {
              color: ${theme.colors.textPrimary};
            }

            &:disabled {
              border-color: ${theme.colors.borderSecondary};
              color: ${theme.colors.textDisabled};
            }
          `;
      }
    })()}
  &:disabled {
    cursor: not-allowed;
  }
`;

export default Button;

export const ButtonGroup = styled.div`
  display: flex;
  width: 100%;
  box-sizing: border-box;

  & > button {
    height: 40px;
    border-radius: 0;

    ${media.mobile} {
      height: 32px;
    }

    ${TEXT_TYPES_MAP[TEXT_TYPES.BUTTON_SECONDARY]}
    :hover {
      background: ${({ theme }) => theme.colors.borderPrimary};
    }

    :disabled {
      background: transparent;
    }

    :active {
      background: transparent;
    }
  }

  & > :first-of-type {
    border-radius: 10px 0 0 10px;
  }

  & > :last-of-type {
    border-radius: 0 10px 10px 0;
  }
`;
