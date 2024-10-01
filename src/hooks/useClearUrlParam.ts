import { useEffect } from "react";

export const useClearUrlParam = (paramKey: string) => {
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    params.delete(paramKey);

    url.search = params.toString();

    window.history.replaceState({}, document.title, url.toString());
  }, [paramKey]);
};
