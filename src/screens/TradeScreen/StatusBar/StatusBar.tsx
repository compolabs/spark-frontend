import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Row } from "@components/Flex";
import Text, { TEXT_TYPES } from "@components/Text";
import { TWITTER_LINK } from "@src/constants";

import tweets from "./tweets";

const StatusBar: React.FC = observer(() => {
  const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweets[Math.floor(Math.random() * tweets.length)],
  )}`;

  // const networkName = "FUEL";

  return (
    <Root>
      <Row alignItems="center" mainAxisSize="fit-content" style={{ flex: 1 }}>
        <a href={TWITTER_LINK} rel="noreferrer noopener" target="_blank">
          <LinkText type={TEXT_TYPES.SUPPORTING}>Twitter</LinkText>
        </a>
      </Row>
      <Row alignItems="center" justifyContent="center" mainAxisSize="fit-content" style={{ flex: 1 }}>
        <a href={tweet} rel="noreferrer noopener" target="_blank">
          <LinkText type={TEXT_TYPES.SUPPORTING}>✨Wanna sparkle?</LinkText>
        </a>
      </Row>
      <Row alignItems="center" justifyContent="flex-end" mainAxisSize="fit-content" style={{ flex: 1 }}>
        {/*<Text type={TEXT_TYPES.SUPPORTING}>{networkName}</Text>*/}
        <Text type={TEXT_TYPES.SUPPORTING}>Powered by Fuel</Text>
      </Row>

      {/*
      <Row alignItems="center" mainAxisSize="fit-content">
        <Indicator error={!accountStore.address} />
        <SizedBox width={8} />
        <Text type={TEXT_TYPES.SUPPORTING}>Stable Connection</Text>
      </Row>
      <Row alignItems="center" mainAxisSize="fit-content">
        <Indicator />
        <SizedBox width={8} />
        <Text type={TEXT_TYPES.SUPPORTING}> Response Time Name holder (xxxms)</Text>
      </Row>
      <DesktopRow>
        <Divider />
        <Text type={TEXT_TYPES.SUPPORTING}>XX,XXX TPS</Text>
        <Divider />
        <Text type={TEXT_TYPES.SUPPORTING}>Average Gas Prices:</Text>
        <SizedBox width={8} />
        <Chip>SPOT:&nbsp;X,XXXX€</Chip>
        <SizedBox width={8} />
        <Chip>PERP:&nbsp;X,XXXX€</Chip>
      </DesktopRow>
      */}
    </Root>
  );
});

export default StatusBar;

const Root = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 26px;
  box-sizing: border-box;
  justify-content: space-between;
  //border: 1px solid white;
  //padding: 0 16px;
  flex-shrink: 0;
`;

const Indicator = styled.div<{
  error?: boolean;
}>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme, error }) => (error ? theme.colors.redLight : theme.colors.greenLight)};
`;

const Divider = styled.div`
  width: 1px;
  height: 18px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  margin: 0 8px;
`;

const LinkText = styled(Text)`
  ${TEXT_TYPES.SUPPORTING};
  transition: 0.4s;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;
