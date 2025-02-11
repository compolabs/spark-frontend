import React from "react";
import styled from "@emotion/styled";
import dayjs from "dayjs";

import "dayjs/locale/en";

dayjs.locale("en");
import { observer } from "mobx-react";

import { BN } from "@compolabs/spark-orderbook-ts-sdk";

import { CountdownTimer } from "@components/CountdownTimer.tsx";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import Tooltip from "@components/Tooltip";
import { media } from "@themes/breakpoints";

import ArrowRightIcon from "@assets/icons/arrowRight.svg?react";
import InfoIcon from "@assets/icons/info.svg?react";

import { useStores } from "@stores";

import { POINTS_LINK } from "@constants";
import TOKEN_LOGOS from "@constants/tokenLogos";
import { CONFIG } from "@utils/getConfig.ts";

import setting from "./setting.json";

const LiveBox = () => {
  const isLive = dayjs().isBefore(dayjs(setting.endDate));
  return (
    <SmartFlex alignItems="center" gap="8px">
      <TitleText type={TEXT_TYPES.H} primary>
        {dayjs(setting.startDate).format("MMM D")}
      </TitleText>
      <ArrowRightIcon />
      <TitleText type={TEXT_TYPES.H} primary>
        {dayjs(setting.endDate).format("MMM D")}
      </TitleText>
      <TitleText type={TEXT_TYPES.H} secondary>
        {dayjs(setting.endDate).format("h:mm A")}
      </TitleText>
      <LiveLight isLive={isLive}>
        <LiveCircle isLive={isLive} />
        <Text primary>Live</Text>
      </LiveLight>
    </SmartFlex>
  );
};

export const CompetitionsInfo = observer(() => {
  const { spotOrderBookStore } = useStores();
  const fuelMarket = CONFIG.MARKETS.find((m) => m.marketName === "FUELUSDC");
  const prizeToUsdc = new BN(spotOrderBookStore.marketPriceByContractId(fuelMarket?.contractId ?? ""))
    .multipliedBy(setting.prizePoolFuel)
    .toSignificant(2);
  return (
    <CompetitionsInfoContainer>
      <CompetitionsInfoHeader>
        <TitleText type={TEXT_TYPES.H} primary>
          TRADING COMPETITION
        </TitleText>
        <LiveBox />
      </CompetitionsInfoHeader>
      <CompetitionsContainer>
        <SmartFlex center="y" justifyContent="space-between" width="100%">
          <SmartFlex gap="8px" column>
            <Tooltip
              content={
                <SmartFlex gap="4px" padding="8px" width="300px" column>
                  <Text type={TEXT_TYPES.BODY} primary></Text>
                </SmartFlex>
              }
            >
              <SmartFlex center="y" gap="4px">
                <Text type={TEXT_TYPES.BODY} primary>
                  Prize Pool
                </Text>
                <InfoIconStyled />
              </SmartFlex>
            </Tooltip>
            <SmartFlex gap="8px">
              <Text type={TEXT_TYPES.H} primary>
                ${prizeToUsdc}
              </Text>
              <Text type={TEXT_TYPES.H} secondary>
                |
              </Text>
              <SmartFlex gap="4px">
                <img height="16px" src={TOKEN_LOGOS.FUEL} width="16px" />
                <Text type={TEXT_TYPES.H} primary>
                  {new BN(setting.prizePoolFuel).toSignificant(2)} FUEL
                </Text>
              </SmartFlex>
            </SmartFlex>
          </SmartFlex>
          <SmartFlex gap="8px" column>
            <Tooltip
              content={
                <SmartFlex gap="4px" padding="8px" width="300px" column>
                  <Text type={TEXT_TYPES.BODY} primary></Text>
                </SmartFlex>
              }
            >
              <SmartFlex center="y" gap="4px">
                <Text type={TEXT_TYPES.BODY} primary>
                  Competition ends in
                </Text>
                <InfoIconStyled />
              </SmartFlex>
            </Tooltip>
            <CountdownTimer targetTime={new Date(setting.endDate).getTime()} />
          </SmartFlex>
        </SmartFlex>
        <Divider />
        <InfoContainer>
          <Text type={TEXT_TYPES.BODY} primary>
            Prizes will be distributed directly to the winners&#39; wallets connected to their participating V12 account
            shortly after the competition ends
          </Text>
          <ExternalLink href={POINTS_LINK} rel="noreferrer noopener" target="_blank">
            Learn More →
          </ExternalLink>
        </InfoContainer>
      </CompetitionsContainer>
    </CompetitionsInfoContainer>
  );
});

const CompetitionsInfoContainer = styled(SmartFlex)`
  width: 100%;
  margin-bottom: 8px;
  justify-content: space-between;
  flex-direction: column;
`;
const CompetitionsContainer = styled(SmartFlex)`
  border: 1px solid ${({ theme }) => theme.colors.accentPrimary};

  border-radius: 8px;

  flex-direction: column;
  gap: 16px;

  padding: 24px 24px 16px;

  width: 100%;

  ${media.mobile} {
    gap: 12px;
    padding: 12px;
  }
`;

const InfoIconStyled = styled(InfoIcon)`
  width: 12px;
  height: 12px;

  & > path {
    fill: ${({ theme }) => theme.colors.textDisabled};
  }
`;

const Divider = styled(SmartFlex)`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.greenMedium};
`;

const InfoContainer = styled(SmartFlex)`
  justify-content: space-between;

  ${media.mobile} {
    flex-direction: column;
    gap: 8px;
  }
`;

const ExternalLink = styled.a`
  ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}

  color: ${({ theme }) => theme.colors.greenStrong};

  cursor: pointer;
`;

const TitleText = styled(Text)`
  display: flex;
  align-items: center;
`;

const CompetitionsInfoHeader = styled(SmartFlex)`
  gap: 8px;
  justify-content: space-between;
  padding: 32px 0px 16px 0px;
  ${media.mobile} {
    flex-direction: column;
  }
`;

const LiveLight = styled(SmartFlex)<{ isLive: boolean }>`
  padding: 4px 12px 4px 8px;
  background: ${({ theme, isLive }) => (isLive ? theme.colors.greenDark : theme.colors.redDark)};
  border: 1px solid ${({ theme, isLive }) => (isLive ? theme.colors.greenLight : theme.colors.redLight)};
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  height: 32px;
  margin-left: 16px;
`;

const LiveCircle = styled(SmartFlex)<{ isLive: boolean }>`
  width: 10px;
  height: 10px;
  background: ${({ theme, isLive }) => (isLive ? theme.colors.greenLight : theme.colors.redLight)};
  border-radius: 100%;
`;
