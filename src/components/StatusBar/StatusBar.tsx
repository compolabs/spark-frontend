import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";

import DiscordIcon from "@assets/social/discord.svg?react";
import GitHubIcon from "@assets/social/github.svg?react";
import XIcon from "@assets/social/x.svg?react";

import { DISCORD_LINK, FUEL_LINK, GITHUB_LINK, TWITTER_LINK } from "@constants";
import { getDeviceInfo } from "@utils/getDeviceInfo";

const StatusBar: React.FC = observer(() => {
  const { isIOS } = getDeviceInfo();

  return (
    <StatusBarContainer isIOS={isIOS}>
      <FooterText type={TEXT_TYPES.TEXT}>
        Powered by&nbsp;<LinkStyled href={FUEL_LINK}>Fuel</LinkStyled>
      </FooterText>
      <SmartFlex gap="18px">
        <LinkStyled href={TWITTER_LINK} rel="noreferrer noopener" target="_blank">
          <XIconStyled />
        </LinkStyled>
        <LinkStyled href={DISCORD_LINK} rel="noreferrer noopener" target="_blank">
          <DiscordIconStyled />
        </LinkStyled>
        <LinkStyled href={GITHUB_LINK} rel="noreferrer noopener" target="_blank">
          <GitHubIcon />
        </LinkStyled>
      </SmartFlex>
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

  padding: 8px 0px;

  ${LinkStyled} {
    display: flex;
    align-items: center;
  }
`;

const XIconStyled = styled(XIcon)`
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const DiscordIconStyled = styled(DiscordIcon)`
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
