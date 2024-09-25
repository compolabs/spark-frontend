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
        <rect height="40" rx="6" ry="6" width={maxInnerWidth} x={padding} y={padding} />

        <rect height="20" rx="6" ry="6" width={maxInnerWidth * 0.7} x={padding} y={padding + 40 + 23} />
      </>
    );
  },
  desktop: (data: Dimensions) => {
    const padding = 12;

    const maxInnerWidth = data.width - 2 * padding;

    return (
      <>
        <rect height="40" rx="6" ry="6" width={maxInnerWidth} x={padding} y={padding} />

        <rect height="20" rx="6" ry="6" width={maxInnerWidth * 0.7} x={padding} y="62" />
      </>
    );
  },
};

const ChartSkeletonWrapper = styled(clone(SkeletonWrapper, { skeletonLayouts: SKELETON_LAYOUTS }))`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 10px;

  min-height: 416px;
`;

export default ChartSkeletonWrapper;
