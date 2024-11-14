export type BreakPointTypes = "desktop" | "mobile";

export type Breakpoints = Record<BreakPointTypes, number>;

export const breakpoints: Breakpoints = {
  desktop: 1200,
  mobile: 880,
};

export const breakpointsHeight: Breakpoints = {
  desktop: 1200,
  mobile: 700,
};

export const media: Record<BreakPointTypes, string> = {
  desktop: `@media (min-width: ${breakpoints.mobile}px)`,
  mobile: `@media (max-width: ${breakpoints.mobile}px)`,
};

export const mediaHeight: Record<BreakPointTypes, string> = {
  desktop: `@media (min-width: ${breakpointsHeight.mobile}px)`,
  mobile: `@media (max-width: ${breakpointsHeight.mobile}px)`,
};
