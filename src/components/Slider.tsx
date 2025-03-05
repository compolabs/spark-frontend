import React from "react";
import styled from "@emotion/styled";
import RCSlider, { SliderProps } from "rc-slider";

import { Row } from "@components/Flex";
import { TEXT_TYPES_MAP } from "@components/Text";
import { media } from "@themes/breakpoints";

import "rc-slider/assets/index.css";

interface IProps {
  percent?: number;
  symbol?: string;
  fixSize?: number;
}

const Slider: React.FC<SliderProps & IProps> = (props) => (
  <Root>
    <DotsContainer>
      {Array.from({ length: 10 }, (_, i) => (
        <Dot key={i} />
      ))}
    </DotsContainer>
    <StyledSlider {...props} />
  </Root>
);

export default Slider;

const Dot = styled.div`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.iconSecondary};
  z-index: 1;
`;

const Root = styled.div`
  background: ${({ theme }) => theme.colors.bgPrimary};
  height: 32px;
  box-sizing: border-box;
  padding: 0 23px 0 25px;
  border-radius: 32px;
  position: relative;

  &::after {
    position: absolute;
    z-index: 1;
    left: 2px;
    top: 2px;
    bottom: 2px;
    content: "";
    display: flex;
    height: 28px;
    box-sizing: border-box;
    width: 30px;
    cursor: pointer;
    border-radius: 32px 0 0 32px;
    border: 1px solid ${({ theme }) => theme.colors.borderAccent};
    background: ${({ theme }) => theme.colors.bgSecondary};

    ${media.mobile} {
      height: 20px;
    }
  }

  ${media.mobile} {
    height: 24px;
  }
`;

const StyledSlider = styled(RCSlider)<IProps>`
  padding: 0;

  .rc-slider-rail {
    width: 100%;
    height: 32px;
    border-radius: 32px;
    outline: 0;
    background: ${({ theme }) => theme.colors.bgPrimary};
    z-index: 0;

    ${media.mobile} {
      height: 24px;
    }
  }

  .rc-slider-track {
    height: 28px;
    cursor: pointer;
    top: 2px;
    border: 1px solid ${({ theme }) => theme.colors.borderAccent};
    border-left: none;
    border-radius: 0;
    background: ${({ theme }) => theme.colors.bgSecondary};
    z-index: 2;

    ${media.mobile} {
      height: 20px;
    }
  }

  .rc-slider-handle {
    z-index: 2;
    border: 1px solid ${({ theme }) => theme.colors.borderAccent};
    color: ${({ theme }) => theme.colors.textSecondary};
    border-left: none;
    border-radius: 0 32px 32px 0;
    justify-content: center;

    background: transparent;
    background: ${({ theme }) => theme.colors.bgSecondary};

    opacity: 1;
    height: 28px;
    width: 30px;
    cursor: pointer;
    top: 7px;
    margin-left: 4px;

    &:hover {
      border-color: ${({ theme }) => theme.colors.borderAccent};
    }

    ${media.mobile} {
      height: 20px;
    }

    &-dragging {
      border: 1px solid ${({ theme }) => theme.colors.borderAccent} !important;
      border-left: none !important;
      box-shadow: none !important;
      margin-left: 4px;
    }

    &:focus-visible {
      box-shadow: none !important;
    }

    &:active {
      box-shadow: none !important;
    }

    &::after {
      content: "${({ percent, symbol, fixSize }) =>
        `${percent !== 0 ? "<" : ""} ${percent?.toFixed(!fixSize || percent === 0 ? 0 : fixSize)}${symbol ?? "%"} ${
          percent !== 100 ? ">" : " "
        } `}";
      height: 28px;
      position: absolute;
      top: 6px;
      right: 4px;
      white-space: nowrap;
      ${TEXT_TYPES_MAP.BODY};

      ${media.mobile} {
        height: 20px;
        top: 2px;
      }
    }
  }
`;

const DotsContainer = styled(Row)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  width: 100%;
  height: 32px;
  align-items: center;
  justify-content: space-around;

  ${media.mobile} {
    height: 24px;
  }
`;
