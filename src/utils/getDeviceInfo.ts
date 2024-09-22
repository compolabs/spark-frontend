import { breakpoints } from "@themes/breakpoints";

const isIOS = () => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

const isAndroid = () => {
  return /Android/i.test(navigator.userAgent);
};

const isPWA = () => {
  return window.matchMedia("(display-mode: standalone)").matches;
};

const isMobile = () => {
  return window.innerWidth <= breakpoints.mobile;
};

export const getDeviceInfo = () => {
  return {
    isMobile: isMobile(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isPWA: isPWA(),
  };
};
