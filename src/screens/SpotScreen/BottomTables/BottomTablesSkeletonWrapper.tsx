import React from "react";
import styled from "@emotion/styled";

import SkeletonWrapper, { Dimensions } from "@components/SkeletonWrapper";
import { media } from "@themes/breakpoints";

import { clone } from "@utils/clone";

import { MAX_TABLE_HEIGHT } from "./constants";

const SKELETON_LAYOUTS = {
  mobile: (data: Dimensions) => {
    const padding = 16;

    const maxInnerWidth = data.width - 2 * padding;

    return (
      <>
        <rect height="40" rx="6" ry="6" width={maxInnerWidth * 0.6} x={padding} y={padding} />
      </>
    );
  },
  desktop: (data: Dimensions) => {
    const padding = 12;

    const maxInnerWidth = data.width - 2 * padding;

    return (
      <>
        <rect height="40" rx="6" ry="6" width={maxInnerWidth * 0.3} x={padding} y={padding} />
      </>
    );
  },
};

const BottomTablesSkeletonWrapper = styled(clone(SkeletonWrapper, { skeletonLayouts: SKELETON_LAYOUTS }))`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 10px;

  height: ${MAX_TABLE_HEIGHT[2]};

  ${media.mobile} {
    height: auto;
    flex-grow: 1;
  }
`;

export default BottomTablesSkeletonWrapper;
