import React from "react";
import styled from "@emotion/styled";

import SkeletonWrapper, { Dimensions } from "@components/SkeletonWrapper";
import { media } from "@themes/breakpoints";

import { clone } from "@utils/clone";

import { MAX_TABLE_HEIGHT } from "../../screens/SpotScreen/BottomTables/constants";

const createSkeletonLayout = (padding: number, widthFactor: number, data: Dimensions) => {
  const maxInnerWidth = Math.max(data.width - 2 * padding, 0);

  return <rect height="40" rx="6" ry="6" width={maxInnerWidth * widthFactor} x={padding} y={padding} />;
};

const SKELETON_LAYOUTS = {
  mobile: (data: Dimensions) => createSkeletonLayout(16, 0.6, data),
  desktop: (data: Dimensions) => createSkeletonLayout(12, 0.3, data),
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
