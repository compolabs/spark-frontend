import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import numeral from "numeral";

import { Column } from "@components/Flex";
import { SmartFlex } from "@components/SmartFlex";
import { ConfigProps, DataArray } from "@components/TableOrderBook/TableOrderBook";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

interface HistoryOrderBookProps {
  firstData: DataArray[];
  secondData?: DataArray[];
  config: ConfigProps;
}
const SellAndBuy = ({ firstData, secondData, config }: HistoryOrderBookProps) => {
  const theme = useTheme();

  const renderSpread = () => {
    let price = config.isSpreadValid ? config.spreadPrice : "-";
    price = price === "-" ? price : numeral(price).format(`0.${"0".repeat(config.decimalGroup ?? 0)}a`);
    const percent = config.isSpreadValid ? config.spreadPercent : "-";
    if (media.mobile) {
      return (
        <SpreadContainer>
          <Text type={TEXT_TYPES.H} primary>
            {price}
          </Text>
          <Text>{`(${percent}%)`}</Text>
        </SpreadContainer>
      );
    }

    return (
      <SpreadContainer>
        <Text type={TEXT_TYPES.SUPPORTING}>SPREAD</Text>
        <Text primary>{price}</Text>
        <Text>{`(${percent}%) `}</Text>
      </SpreadContainer>
    );
  };

  const generateRow = (data: DataArray[]) =>
    data.map((trade, index) => (
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
    ));
  return (
    <Container>
      <OrderBookColumn>
        <SmartFlexOrder flexDirection="column-reverse">{generateRow(firstData)}</SmartFlexOrder>
        {renderSpread()}
        <SmartFlexOrder>{generateRow(secondData ?? [])}</SmartFlexOrder>
      </OrderBookColumn>
    </Container>
  );
};
export default SellAndBuy;

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

const SmartFlexOrder = styled(SmartFlex)<{ flexDirection?: string }>`
  flex-direction: ${({ flexDirection }) => flexDirection ?? "column"};
  flex-grow: 1;
  width: 100%;
  height: 0;
  overflow: hidden;
`;

const OrderBookColumn = styled(Column)`
  height: 100%;
  width: 100%;
`;

const SpreadContainer = styled(SmartFlex)`
  padding-left: 12px;
  height: 24px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  align-items: center;
  gap: 12px;
  width: 100%;
`;
