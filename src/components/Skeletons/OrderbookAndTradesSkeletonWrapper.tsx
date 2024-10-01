import React from "react";
import styled from "@emotion/styled";

import SkeletonWrapper, { Dimensions } from "@components/SkeletonWrapper";

import { clone } from "@utils/clone";

const createSkeletonLayout = (padding: number, data: Dimensions) => {
  const maxInnerWidth = Math.max(data.width - 2 * padding, 0);

  return (
    <>
      <rect height="40" rx="6" ry="6" width={maxInnerWidth} x={padding} y={padding} />
      <rect height="20" rx="6" ry="6" width={maxInnerWidth * 0.7} x={padding} y={padding + 40 + 22} />
    </>
  );
};

const SKELETON_LAYOUTS = {
  mobile: (data: Dimensions) => createSkeletonLayout(16, data),
  desktop: (data: Dimensions) => createSkeletonLayout(12, data),
};

const ChartSkeletonWrapper = styled(clone(SkeletonWrapper, { skeletonLayouts: SKELETON_LAYOUTS }))`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 10px;

  min-height: 416px;
`;

export default ChartSkeletonWrapper;
