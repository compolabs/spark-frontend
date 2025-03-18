import { breakpoints, BreakPointTypes } from "@themes/breakpoints";

import { useWindowSize } from "./useWindowSize";

type MediaBreakpoints = Record<BreakPointTypes, boolean>;
export interface Media extends MediaBreakpoints {
  currentMedia: BreakPointTypes;
}

export const useMedia = (): Media => {
  const { width } = useWindowSize();
  const media: MediaBreakpoints = {
    mobile: width <= breakpoints.mobile,
    desktop: width > breakpoints.mobile,
  };

  const currentMedia = Object.keys(media).filter((key) => media[key as BreakPointTypes]) as BreakPointTypes[];

  return {
    ...media,
    currentMedia: currentMedia[0],
  };
};
