import React from "react";
import styled from "@emotion/styled";

interface ResponsiveImageProps {
  src: string;
  alt: string;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({ src, alt }) => {
  return <StyledImage alt={alt} loading="lazy" role="img" src={src} tabIndex={0} />;
};

const StyledImage = styled.img`
  aspect-ratio: 2.36;
  object-fit: contain;
  object-position: center;
  width: 100%;
  border-radius: 8px;
  min-width: 240px;
  flex: 1;
  flex-basis: 32px;

  @media (max-width: 991px) {
    max-width: 100%;
  }
`;

export default ResponsiveImage;
