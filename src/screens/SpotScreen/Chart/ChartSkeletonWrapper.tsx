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
        <rect height="20" rx="6" ry="6" width={maxInnerWidth * 0.4} x={padding} y={padding} />
        <rect height="20" rx="6" ry="6" width={maxInnerWidth * 0.15} x={padding} y={padding + 20} />
      </>
    );
  },
  desktop: (data: Dimensions) => {
    const padding = 12;

    const maxInnerWidth = data.width - 2 * padding;

    return (
      <>
        <rect height="20" rx="6" ry="6" width={maxInnerWidth * 0.4} x={padding} y={padding} />
        <rect height="20" rx="6" ry="6" width={maxInnerWidth * 0.15} x={padding} y={padding + 30} />
      </>
    );
  },
};

const ChartSkeletonWrapper = styled(clone(SkeletonWrapper, { skeletonLayouts: SKELETON_LAYOUTS, children: true }))`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 10px;
`;

export default ChartSkeletonWrapper;
