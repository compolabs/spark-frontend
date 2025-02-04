import React, { useMemo } from "react";
import styled from "@emotion/styled";
import copy from "copy-to-clipboard";
import { observer } from "mobx-react";

import { TraderVolumeResponse } from "@compolabs/spark-orderbook-ts-sdk";

import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { media } from "@themes/breakpoints";

import copyIcon from "@assets/icons/copy.svg";
import oneSt from "@assets/images/1st.png";
import twoSt from "@assets/images/2st.png";
import three from "@assets/images/3st.png";

import { useStores } from "@stores";

const generatePosition = (key: TraderVolumeResponse["id"]) => {
  if (key === 1) return <img alt="1st" height={40} src={oneSt} width={40} />;
  if (key === 2) return <img alt="2st" height={40} src={twoSt} width={40} />;
  if (key === 3) return <img alt="3st" height={40} src={three} width={40} />;
  return (
    <PositionBox>
      <Text type={TEXT_TYPES.H} primary>
        {key}
      </Text>
    </PositionBox>
  );
};

export const LeaderboardItem = observer(({ item }: { item: TraderVolumeResponse }) => {
  const { notificationStore } = useStores();
  const shortAddress = useMemo(() => {
    return `${item.walletId.slice(0, 6)}...${item.walletId.slice(-4)}`;
  }, [item]);

  const handleAddressCopy = () => {
    copy(item.walletId);
    notificationStore.success({ text: "Address was copied!", address: item.walletId });
  };

  return (
    <LeaderboardContainer>
      <LeftContent>
        {generatePosition(item.id)}
        <SmartFlex center="y" gap="8px">
          <AddressText type={TEXT_TYPES.BODY} primary>
            {shortAddress}
          </AddressText>
          <CopyIconStyled src={copyIcon} onClick={handleAddressCopy} />
        </SmartFlex>
        {item.isYour && <SnackStyled>You</SnackStyled>}
      </LeftContent>
      <TextStyled type={TEXT_TYPES.BODY} primary>
        ${item.traderVolume.toFixed(2)}
      </TextStyled>
    </LeaderboardContainer>
  );
});

const AddressText = styled(Text)`
  font-size: 14px;

  ${media.mobile} {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const CopyIconStyled = styled.img`
  width: 16px;
  height: 16px;
`;

const TextStyled = styled(Text)`
  font-size: 14px;
`;

const LeaderboardContainer = styled(SmartFlex)`
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.strokeSecondary};
  &:last-child {
    border-bottom: none;
  }
`;

const LeftContent = styled(SmartFlex)`
  align-items: center;
  gap: 12px;
`;

const PositionBox = styled(SmartFlex)`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.accentPrimary};
  align-items: center;
  justify-content: center;
  border-radius: 4px;
`;

const SnackStyled = styled.span`
  border-radius: 8px;
  background: black;
  display: flex;
  padding: 4px;
  ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}
`;
