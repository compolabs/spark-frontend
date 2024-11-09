import React, { useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { media } from "@themes/breakpoints";

import ArrowUpIcon from "@assets/icons/arrowUp.svg?react";
import SettingsIcon from "@assets/icons/gear.svg?react";
import LightningIcon from "@assets/icons/lightning.svg?react";

import { useStores } from "@stores";

import BN from "@utils/BN";

import { SlippageSettings } from "./SlippageSettings";

interface InfoBlockProps {
  slippage: number;
  updateSlippage: (percent: number) => void;
}

export const InfoBlock: React.FC<InfoBlockProps> = ({ slippage, updateSlippage }) => {
  const theme = useTheme();
  const [showDetails, setShowDetails] = useState(false);
  const [isSlippageSettingOpen, setSlippageSettingOpen] = useState(false);
  const { swapStore, oracleStore, tradeStore } = useStores();
  const exchangeRate = oracleStore
    .getTokenIndexPrice(swapStore.sellToken.priceFeed)
    .dividedBy(oracleStore.getTokenIndexPrice(swapStore.buyToken.priceFeed))
    .toNumber();

  const exchangeFee = tradeStore.exchangeFeeFormat;
  const matcherFee = tradeStore.matcherFeeFormat;
  const totalFee = exchangeFee.plus(matcherFee);
  return (
    <Root>
      <InfoLine onClick={() => setShowDetails(!showDetails)}>
        <Text type={TEXT_TYPES.SUPPORTING}>
          1 {swapStore.sellToken.symbol} = <SpanStyled>{new BN(exchangeRate).toSignificant(6)}</SpanStyled>{" "}
          {swapStore.buyToken.symbol}
        </Text>

        <Text color={theme.colors.greenLight} type={TEXT_TYPES.SUPPORTING}>
          <SmartFlex alignItems="center">
            <LightningIcon />
            Total fee
            <SnackStyled>${totalFee.toSignificant(2)}</SnackStyled>
            <ArrowUpIconStyled showDetails={showDetails} />
          </SmartFlex>
        </Text>
      </InfoLine>
      {showDetails && (
        <>
          <InfoLine>
            <Text type={TEXT_TYPES.SUPPORTING}>Exchange fee</Text>
            <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
              <Text primary>{exchangeFee.toSignificant(2)}$</Text>
            </Text>
          </InfoLine>
          <InfoLine>
            <Text type={TEXT_TYPES.SUPPORTING}>Matcher fee</Text>
            <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
              <Text primary>{matcherFee.toSignificant(2)}$</Text>
            </Text>
          </InfoLine>
          <InfoLine>
            <Text type={TEXT_TYPES.SUPPORTING}>Slippage tolerance</Text>
            <LeftBlock>
              <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
                {slippage}%
              </Text>
              <Icon onClick={() => setSlippageSettingOpen(!isSlippageSettingOpen)} />
            </LeftBlock>
          </InfoLine>
        </>
      )}

      {isSlippageSettingOpen && (
        <SlippageSettings saveSlippage={updateSlippage} onClose={() => setSlippageSettingOpen(false)} />
      )}
    </Root>
  );
};

const Root = styled.div`
  display: flex;
  flex-direction: column !important;
  align-items: center;
  border-radius: 16px;
  padding: 5px 20px;
  gap: 6px;
  width: 100%;
  position: relative;

  ${media.mobile} {
    position: static;
  }
`;

const SpanStyled = styled.span`
  color: ${({ theme }) => `${theme.colors.textPrimary}`};
`;

const ArrowUpIconStyled = styled(ArrowUpIcon)<{ showDetails: boolean }>`
  transform: ${({ showDetails }) => (showDetails ? "rotate(-180deg) !important" : "rotate(0deg)")};
  transition: 300ms ease-in-out;
`;

const SnackStyled = styled.span`
  border-radius: 33px;
  background: rgba(0, 227, 136, 0.15);
  display: flex;
  padding: 2px 6px;
  margin-left: 11px;
  margin-right: 8px;
  ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}
`;

const InfoLine = styled(Text)`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 24px;
  &:not(:last-child) {
    border-bottom: 1px solid #0b0b0b;
  }
  &:first-of-type:hover {
    cursor: pointer;
    ${ArrowUpIconStyled} {
      transform: rotate(-90deg);
    }
  }
`;

const LeftBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Icon = styled(SettingsIcon)`
  cursor: pointer;
  color: ${({ theme }) => `${theme.colors.textSecondary}`};
  transition: 0.4s;
  &:hover {
    color: ${({ theme }) => `${theme.colors.textPrimary}`};
  }
`;
