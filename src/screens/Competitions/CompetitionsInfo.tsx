import React from "react";
import styled from "@emotion/styled";
import dayjs from "dayjs";

import "dayjs/locale/en";

dayjs.locale("en");
import { useTheme } from "@emotion/react";
import { observer } from "mobx-react";

import { BN } from "@compolabs/spark-orderbook-ts-sdk";

import { CountdownTimer } from "@components/CountdownTimer.tsx";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import ArrowRightIcon from "@assets/icons/arrowRight.svg?react";

import { useStores } from "@stores";

import { HowToParticipate } from "@screens/Competitions/HowToParticipate.tsx";

import TOKEN_LOGOS from "@constants/tokenLogos";
import { CONFIG } from "@utils/getConfig.ts";

import setting from "./setting.json";

const LiveBox = ({ live }: { live: string }) => {
  const theme = useTheme();

  const colorLive = live === "Pending" ? "#F2D336" : live === "Ended" ? theme.colors.greenLight : theme.colors.redLight;

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
      <LiveLight colorLive={colorLive}>
        <LiveCircle colorLive={colorLive} />
        <Text primary>{live}</Text>
      </LiveLight>
    </SmartFlex>
  );
};

export const CompetitionsInfo = observer(({ live }: { live: string }) => {
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
        <LiveBox live={live} />
      </CompetitionsInfoHeader>
      <CompetitionsContainer>
        <CompetitionsTitle>
          <SmartFlex gap="8px" column>
            <SmartFlex center="y" gap="4px">
              <Text type={TEXT_TYPES.BODY} secondary>
                Prize Pool
              </Text>
            </SmartFlex>
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
            <SmartFlex center="y" gap="4px">
              <Text type={TEXT_TYPES.BODY} secondary>
                {live === "Pending" && "Competition starts in"}
                {live === "Live" && "Competition ends in"}
              </Text>
            </SmartFlex>
            {live === "Pending" && <CountdownTimer targetTime={new Date(setting.startDate).getTime()} />}
            {live === "Live" && <CountdownTimer targetTime={new Date(setting.endDate).getTime()} />}
          </SmartFlex>
        </CompetitionsTitle>
        {live !== "Ended" && (
          <>
            <Divider />
            <HowToParticipate />
          </>
        )}
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
  background: #171717;
  flex-direction: column;
  gap: 16px;

  padding: 24px 24px 16px;

  width: 100%;

  ${media.mobile} {
    gap: 12px;
    padding: 12px;
  }
`;

const Divider = styled(SmartFlex)`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.strokeSecondary};
`;

const CompetitionsTitle = styled(SmartFlex)`
  width: 100%;
  justify-content: space-between;
  ${media.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
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

const LiveLight = styled(SmartFlex)<{ colorLive: string }>`
  padding: 4px 12px 4px 8px;
  // background: ${({ colorLive }) => colorLive};
  border: 1px solid ${({ colorLive }) => colorLive};
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  height: 32px;
  margin-left: 16px;
  border-radius: 4px;
`;

const LiveCircle = styled(SmartFlex)<{ colorLive: string }>`
  width: 10px;
  height: 10px;
  background: ${({ colorLive }) => colorLive};
  border-radius: 100%;
`;
