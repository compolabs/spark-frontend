export const isExternalLink = (link: string) => {
  return link.startsWith("http://") || link.startsWith("https://");
};
