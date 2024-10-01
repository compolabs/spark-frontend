import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import ContentLoader, { IContentLoaderProps } from "react-content-loader";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { useEventListener } from "@hooks/useEventListener";
import { useMedia } from "@hooks/useMedia";

export type Dimensions = { width: number; height: number };

interface SkeletonWrapperProps {
  isReady: boolean;
  children: ReactNode;
  skeletonLayouts: {
    mobile: (data: Dimensions) => JSX.Element;
    desktop: (data: Dimensions) => JSX.Element;
  };
  contentLoaderProps?: IContentLoaderProps;
  className?: string;
}

const SkeletonWrapper: React.FC<SkeletonWrapperProps> = observer(
  ({ isReady, children, skeletonLayouts, contentLoaderProps, className }) => {
    const { mobile } = useMedia();
    const mainContainer = useRef<HTMLDivElement>(null);

    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    const updateDimensions = useCallback(() => {
      if (!mainContainer.current) return;

      const { width, height } = mainContainer.current.getBoundingClientRect();
      setContainerWidth(width);
      setContainerHeight(height);
    }, [isReady]);

    useEventListener("resize", updateDimensions);

    useEffect(() => {
      updateDimensions();
    }, [updateDimensions]);

    if (isReady && children) {
      return <>{children}</>;
    }

    const dimensions: Dimensions = { height: containerHeight, width: containerWidth };
    const skeletonLayout = mobile ? skeletonLayouts.mobile : skeletonLayouts.desktop;

    return (
      <Root ref={mainContainer} className={className}>
        <ContentLoader
          backgroundColor="#232323"
          foregroundColor="#3D3D3D"
          height="100%"
          speed={2}
          width="100%"
          {...contentLoaderProps}
        >
          {skeletonLayout(dimensions)}
        </ContentLoader>
      </Root>
    );
  },
);

export default SkeletonWrapper;

const Root = styled.div`
  width: 100%;
  height: 100%;
`;
