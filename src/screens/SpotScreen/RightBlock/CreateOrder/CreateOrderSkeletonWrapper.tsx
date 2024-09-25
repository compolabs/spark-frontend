import React from "react";
import styled from "@emotion/styled";

import SkeletonWrapper, { Dimensions } from "@components/SkeletonWrapper";

import { clone } from "@utils/clone";

const SKELETON_LAYOUTS = {
  mobile: (data: Dimensions) => {
    const padding = 16;

    const maxInnerWidth = data.width - 2 * padding;
    const halfContainerWidth = maxInnerWidth / 2;

    return (
      <>
        <rect height="40" rx="6" ry="6" width={maxInnerWidth} x={padding} y={padding} />

        <rect height="20" rx="6" ry="6" width={halfContainerWidth - padding / 2} x={padding} y={padding + 40 + 23} />
        <rect
          height="20"
          rx="6"
          ry="6"
          width={halfContainerWidth - padding}
          x={halfContainerWidth + 2 * padding}
          y={padding + 40 + 23}
        />
        <rect
          height="20"
          rx="6"
          ry="6"
          width={halfContainerWidth - padding / 2}
          x={padding}
          y={padding + 40 + 23 + 20 + 35}
        />
        <rect
          height="20"
          rx="6"
          ry="6"
          width={halfContainerWidth - padding}
          x={halfContainerWidth + 2 * padding}
          y={padding + 40 + 23 + 20 + 35}
        />

        <rect height="40" rx="6" ry="6" width={maxInnerWidth} x={padding} y={data.height - padding - 40} />
      </>
    );
  },
  desktop: (data: Dimensions) => {
    const padding = 12;

    const maxInnerWidth = data.width - 2 * padding;
    const halfContainerWidth = maxInnerWidth / 2;

    return (
      <>
        <rect height="40" rx="6" ry="6" width={maxInnerWidth} x={padding} y={padding} />

        <rect height="20" rx="6" ry="6" width={halfContainerWidth - padding / 2} x={padding} y="62" />
        <rect
          height="20"
          rx="6"
          ry="6"
          width={halfContainerWidth - padding}
          x={halfContainerWidth + 2 * padding}
          y="62"
        />
        <rect height="20" rx="6" ry="6" width={halfContainerWidth - padding / 2} x={padding} y="117" />
        <rect
          height="20"
          rx="6"
          ry="6"
          width={halfContainerWidth - padding}
          x={halfContainerWidth + 2 * padding}
          y="117"
        />

        <rect height="40" rx="6" ry="6" width={maxInnerWidth} x={padding} y={data.height / 3} />
      </>
    );
  },
};

const CreateOrderSkeletonWrapper = styled(clone(SkeletonWrapper, { skeletonLayouts: SKELETON_LAYOUTS }))`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 10px;

  min-height: 416px;
`;

export default CreateOrderSkeletonWrapper;
