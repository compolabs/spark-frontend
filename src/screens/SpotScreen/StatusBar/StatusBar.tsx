import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";
import { media } from "@themes/breakpoints";

import XIcon from "@assets/social/x.svg?react";

import { useMedia } from "@hooks/useMedia";

import { FUEL_LINK, TWITTER_LINK } from "@constants";
import { getDeviceInfo } from "@utils/getDeviceInfo";

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
      <FooterText>
        Powered by&nbsp;<LinkStyled href={FUEL_LINK}>Fuel</LinkStyled>
      </FooterText>
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
  display: flex;
  align-items: center;

  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};

  ${media.mobile} {
    font-size: 14px;
  }

  ${LinkStyled} {
    color: ${({ theme }) => theme.colors.greenLight};
  }
`;

const LinkText = styled(FooterText)`
  transition: 250ms;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.greenLight};
  }
`;
