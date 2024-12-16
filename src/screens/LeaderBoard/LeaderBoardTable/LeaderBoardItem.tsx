import React from "react";
import { SmartFlex } from "@components/SmartFlex.tsx";
import styled from "@emotion/styled";
import Text, { TEXT_TYPES } from "@components/Text";

const generatePosition = (key: number) => {
  return (
    <PositionBox>
      <Text type={TEXT_TYPES.H} primary>{key}</Text>
    </PositionBox>
  )
}

export const LeaderBoardItem = ({item}: any) => {
  return (
    <LeaderBoardContainer>
      <LeftContent>
        {generatePosition(item.key)}
        <TextStyled type={TEXT_TYPES.BODY} primary>{item.add}</TextStyled>
      </LeftContent>
      <TextStyled primary type={TEXT_TYPES.BODY}>{item.volume}</TextStyled>
    </LeaderBoardContainer>
  )
}

const TextStyled = styled(Text)`
    font-size: 14px;
`

const LeaderBoardContainer = styled(SmartFlex)`
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.strokeSecondary};
    &:last-child {
        border-bottom: none;
    }
`

const LeftContent = styled(SmartFlex)`
    align-items: center;
    gap: 12px;
`

const PositionBox = styled(SmartFlex)`
    width: 40px;
    height: 40px;
    background: ${({theme }) => (theme.colors.accentPrimary)};
    align-items: center;
    justify-content: center;
    border-radius: 4px;
`