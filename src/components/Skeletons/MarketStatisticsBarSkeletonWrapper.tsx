import React from "react";
import styled from "@emotion/styled";

import SkeletonWrapper, { Dimensions } from "@components/SkeletonWrapper";
import { media } from "@themes/breakpoints";

import { clone } from "@utils/clone";

const SKELETON_LAYOUTS = {
  mobile: () => {
    const padding = 12;

    return (
      <>
        <circle cx={padding + 12} cy="20" r="12" />
        <circle cx={padding + 28} cy="20" r="12" />

        <rect height="28" rx="6" ry="6" width="152" x="60" y="7" />
      </>
    );
  },
  desktop: (data: Dimensions) => {
    const padding = 12;
    const rectWidth = 102;

    const maxInnerWidth = data.width - 2 * padding;

    const rectGap = 16;
    const totalRectWidth = (rectWidth + rectGap) * 4 - rectGap;
    const startX = (maxInnerWidth - totalRectWidth) / 2;

    return (
      <>
        <circle cx={padding + 12} cy="24" r="12" />
        <circle cx={padding + 28} cy="24" r="12" />

        <rect height="30" rx="6" ry="6" width="152" x="60" y="9" />

        <rect height="20" rx="6" ry="6" width={rectWidth} x={startX} y="14" />
        <rect height="20" rx="6" ry="6" width={rectWidth} x={startX + rectWidth + rectGap} y="14" />
        <rect height="20" rx="6" ry="6" width={rectWidth} x={startX + 2 * (rectWidth + rectGap)} y="14" />
        <rect height="20" rx="6" ry="6" width={rectWidth} x={startX + 3 * (rectWidth + rectGap)} y="14" />

        <rect height="20" rx="6" ry="6" width={rectWidth} x={maxInnerWidth - rectWidth - padding} y="14" />
      </>
    );
  },
};

const MarketStatisticsBarSkeletonWrapper = styled(clone(SkeletonWrapper, { skeletonLayouts: SKELETON_LAYOUTS }))`
  height: 48px;
  width: 100%;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 10px;

  ${media.mobile} {
    height: 40px;
    min-height: 40px;
  }
`;

export default MarketStatisticsBarSkeletonWrapper;
