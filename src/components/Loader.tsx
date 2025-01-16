import React from "react";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";

import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";

import sparkLogoIcon from "@assets/icons/sparkLogoIcon.svg";

interface Props {
  size?: number;
  hideText?: boolean;
  text?: string;
  className?: string;
}

const Loader: React.FC<Props> = ({ size = 64, hideText, text = "Loading", className }) => {
  return (
    <SmartFlex className={className} gap="8px" height="100%" width="100%" center column>
      <LoaderLogoImage alt="loader" height={size} src={sparkLogoIcon} width={size} />
      {!hideText && <Text primary>{text}</Text>}
    </SmartFlex>
  );
};

export default Loader;

const pulse = keyframes`
  from { transform: scale(1.2); }
  to { transform: scale(1.5); }
`;

const LoaderLogoImage = styled.img`
  animation: ${pulse} 1s infinite ease-in-out alternate;
`;
