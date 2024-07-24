import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Text from "@components/Text";
import XIcon from "@src/assets/social/x.svg?react";
import { SmartFlex } from "@src/components/SmartFlex";
import { TWITTER_LINK } from "@src/constants";
import { useMedia } from "@src/hooks/useMedia";
import { media } from "@src/themes/breakpoints";
import { getDeviceInfo } from "@src/utils/getDeviceInfo";

import tweets from "./tweets";

const StatusBar: React.FC = observer(() => {
  const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweets[Math.floor(Math.random() * tweets.length)],
  )}`;

  const media = useMedia();
  const { isIOS } = getDeviceInfo();

  return (
    <StatusBarContainer isIOS={isIOS}>
      <LinkStyled href={tweet} rel="noreferrer noopener" target="_blank">
        <LinkText>✨Wanna sparkle?</LinkText>
      </LinkStyled>
      {media.mobile && (
        <LinkStyled href={TWITTER_LINK} rel="noreferrer noopener" target="_blank">
          <XIconStyled />
        </LinkStyled>
      )}
      <FooterText>Powered by Fuel</FooterText>
    </StatusBarContainer>
  );
});

export default StatusBar;

const LinkStyled = styled.a``;

const StatusBarContainer = styled(SmartFlex)<{ isIOS: boolean }>`
  align-items: center;
  width: 100%;
  height: 28px;
  justify-content: space-between;

  padding: 12px 16px;

  ${LinkStyled} {
    display: flex;
    align-items: center;
  }

  ${({ isIOS }) => isIOS && `padding-bottom: 48px;`};
`;

const XIconStyled = styled(XIcon)`
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const FooterText = styled(Text)`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};

  ${media.mobile} {
    font-size: 14px;
  }
`;

const LinkText = styled(FooterText)`
  transition: 250ms;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.greenLight};
  }
`;
