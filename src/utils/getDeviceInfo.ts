const isIOS = () => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

const isAndroid = () => {
  return /Android/i.test(navigator.userAgent);
};

const isPWA = () => {
  return window.matchMedia("(display-mode: standalone)").matches;
};

export const getDeviceInfo = () => {
  return {
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isPWA: isPWA(),
  };
};
