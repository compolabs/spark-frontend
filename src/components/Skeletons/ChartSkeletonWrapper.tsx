import React from "react";
import styled from "@emotion/styled";

import SkeletonWrapper, { Dimensions } from "@components/SkeletonWrapper";

import { clone } from "@utils/clone";

const createSkeletonLayout = (padding: number, yOffset: number, data: Dimensions) => {
  const maxInnerWidth = Math.max(data.width - 2 * padding, 0);

  return (
    <>
      <rect height="20" rx="6" ry="6" width={maxInnerWidth * 0.4} x={padding} y={padding} />
      <rect height="20" rx="6" ry="6" width={maxInnerWidth * 0.15} x={padding} y={padding + yOffset} />
    </>
  );
};

const SKELETON_LAYOUTS = {
  mobile: (data: Dimensions) => createSkeletonLayout(16, 20, data),
  desktop: (data: Dimensions) => createSkeletonLayout(12, 30, data),
};

const ChartSkeletonWrapper = styled(clone(SkeletonWrapper, { skeletonLayouts: SKELETON_LAYOUTS, children: true }))`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 10px;
`;

export default ChartSkeletonWrapper;
