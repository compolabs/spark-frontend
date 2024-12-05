import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import { SmartFlex } from "@components/SmartFlex";
import { DataArray } from "@components/TableOrderBook/TableOrderBook";
import Text, { TEXT_TYPES } from "@components/Text";

const HistoryOrderBook = ({ data }: { data: DataArray[] }) => {
  const theme = useTheme();
  return (
    <Container className="better-scroll">
      {data.map((trade, index) => (
        <Row key={"trade" + trade[index]}>
          <Text color={trade[3] ? theme.colors.redLight : theme.colors.greenLight} type={TEXT_TYPES.BODY}>
            {trade[0]}
          </Text>
          <TextRightAlign color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
            {trade[1]}
          </TextRightAlign>
          <TextRightAlign color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
            {trade[2]}
          </TextRightAlign>
        </Row>
      ))}
    </Container>
  );
};
export default HistoryOrderBook;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  padding: 5px 12px 8px;
  overflow-y: auto;
  height: 100%;
`;

const Row = styled(SmartFlex)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  height: 16px;

  gap: 10px;

  align-items: center;
  justify-content: space-between;
`;

const TextRightAlign = styled(Text)`
  text-align: right !important;
`;
