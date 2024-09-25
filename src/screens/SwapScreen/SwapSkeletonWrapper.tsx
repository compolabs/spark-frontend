import React from "react";
import styled from "@emotion/styled";

import SkeletonWrapper, { Dimensions } from "@components/SkeletonWrapper";

import { clone } from "@utils/clone";

const SKELETON_LAYOUTS = {
  mobile: (data: Dimensions) => {
    const padding = 16;

    const maxInnerWidth = data.width - 2 * padding;

    return (
      <>
        <rect height="20" rx="6" ry="6" width={maxInnerWidth * 0.2} x={padding} y={padding} />
        <rect height="40" rx="6" ry="6" width={maxInnerWidth * 0.4} x={padding} y={padding + 20 + 28} />

        <rect height="20" rx="6" ry="6" width={maxInnerWidth * 0.2} x={padding} y={padding + 20 + 32 + 68} />
        <rect height="40" rx="6" ry="6" width={maxInnerWidth * 0.4} x={padding} y={padding + 20 + 60 + 88} />
      </>
    );
  },
  desktop: (data: Dimensions) => {
    const padding = 12;

    const maxInnerWidth = data.width - 2 * padding;

    return (
      <>
        <rect height="20" rx="6" ry="6" width={maxInnerWidth * 0.2} x={padding} y={padding} />
        <rect height="40" rx="6" ry="6" width={maxInnerWidth * 0.4} x={padding} y={padding + 20 + 28} />

        <rect height="20" rx="6" ry="6" width={maxInnerWidth * 0.2} x={padding} y={padding + 20 + 32 + 68} />
        <rect height="40" rx="6" ry="6" width={maxInnerWidth * 0.4} x={padding} y={padding + 20 + 60 + 88} />
      </>
    );
  },
};

const SwapSkeletonWrapper = styled(clone(SkeletonWrapper, { skeletonLayouts: SKELETON_LAYOUTS }))`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 10px;

  min-height: 240px;
`;

export default SwapSkeletonWrapper;
