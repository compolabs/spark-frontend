import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import { Row } from "@components/Flex";
import { SmartFlex } from "@components/SmartFlex";
import Tab from "@components/Tab";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import { useStores } from "@stores";
import { TRADE_TABLE_SIZE } from "@stores/SettingsStore";

import { MAX_TABLE_HEIGHT } from "./constants";
import { TableActionButtons } from "./TableActionButtons";

interface Props {
  tabs?: { title: string; disabled: boolean; rowCount: number }[];
  children: React.ReactNode;
  activeTab: number;
  onTabClick: (index: number) => void;
  size?: TRADE_TABLE_SIZE;
}

export const BaseTable: React.FC<Props> = observer(({ tabs, activeTab, onTabClick, children, size }) => {
  const { settingsStore } = useStores();

  return (
    <Root gap="16px" size={size ? size : settingsStore.tradeTableSize} column>
      <TableRoot>
        <TabContainer>
          {tabs &&
            tabs.map(({ title, disabled, rowCount }, index) => (
              <Tab
                key={title + index}
                active={activeTab === index}
                disabled={disabled}
                type={TEXT_TYPES.BUTTON_SECONDARY}
                onClick={() => !disabled && onTabClick(index)}
              >
                {title}
                {rowCount > 0 && (
                  <Badge>
                    <Text type={TEXT_TYPES.SUPPORTING} primary>
                      {rowCount}
                    </Text>
                  </Badge>
                )}
              </Tab>
            ))}
          {tabs && <TableActionButtons />}
        </TabContainer>
        <TableContainer className="better-scroll">{children}</TableContainer>
      </TableRoot>
    </Root>
  );
});

const TableRoot = styled.div`
  background: ${({ theme }) => theme.colors.bgSecondary};
  display: flex;
  width: 100%;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.bgSecondary};
  flex: 1;
  border-radius: 10px 10px 0px 0px;
  max-width: 100%;
  height: 100%;

  ${media.mobile} {
    flex: initial;
  }
`;

const Root = styled(SmartFlex)<{ size: TRADE_TABLE_SIZE }>`
  width: 100%;
  height: ${({ size }) => MAX_TABLE_HEIGHT[size]};
  transition: height 200ms;
  ${media.mobile} {
    height: 100%;
  }
`;

const TabContainer = styled(Row)`
  align-items: center;
  padding: 2px 12px;
  position: relative;

  ${Tab} {
    margin: 0 16px;
  }
`;

const TableContainer = styled(SmartFlex)`
  width: 100%;
  height: 100%;
  overflow-y: scroll;
`;

const Badge = styled.div`
  margin-left: 4px;
  background: ${({ theme }) => theme.colors.borderSecondary};
  border-radius: 4px;
  padding: 3px 4px;
`;
