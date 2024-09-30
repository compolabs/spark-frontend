import React from "react";
import styled from "@emotion/styled";

import SkeletonWrapper, { Dimensions } from "@components/SkeletonWrapper";

import { clone } from "@utils/clone";

const createSkeletonLayout = (data: Dimensions) => {
  return <rect height="56" rx="6" ry="6" width={data.width} x={0} y={0} />;
};

const SKELETON_LAYOUTS = {
  mobile: (data: Dimensions) => createSkeletonLayout(data),
  desktop: (data: Dimensions) => createSkeletonLayout(data),
};

const SwapButtonSkeletonWrapper = styled(clone(SkeletonWrapper, { skeletonLayouts: SKELETON_LAYOUTS }))`
  border-radius: 10px;

  width: 100%;
  height: 56px;
`;

export default SwapButtonSkeletonWrapper;
