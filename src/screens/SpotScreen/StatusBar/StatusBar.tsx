import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";

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
        <YellowText>Beta Version.</YellowText>
        <LinkText>
          things may change drastically during the development and your save could break. Play at your own risk!
        </LinkText>
      </LinkStyled>
      {media.mobile && (
        <LinkStyled href={TWITTER_LINK} rel="noreferrer noopener" target="_blank">
          <XIconStyled />
        </LinkStyled>
      )}
      <FooterText type={TEXT_TYPES.TEXT}>
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
  color: ${({ theme }) => theme.colors.textPrimary};
  ${LinkStyled} {
    color: ${({ theme }) => theme.colors.greenLight};
  }
`;

const YellowText = styled(Text)`
  color: #f2d336;
`;
const LinkText = styled(FooterText)`
  transition: 250ms;
  cursor: pointer;
  text-transform: uppercase;

  &:hover {
    color: ${({ theme }) => theme.colors.greenLight};
  }
`;
