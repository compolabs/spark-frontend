import React, { useState } from "react";
import { Config } from "react-popper-tooltip";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import { OrderType } from "@compolabs/spark-orderbook-ts-sdk";

import SizedBox from "@components/SizedBox";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import Tooltip from "@components/Tooltip";
import { media } from "@themes/breakpoints";

import TableSettingsIcon from "@assets/icons/tableSettings.svg?react";
import TableSizeSelectorIcon from "@assets/icons/tablesSizeSelector.svg?react";

import { useStores } from "@stores";
import { TRADE_TABLE_SIZE } from "@stores/SettingsStore";

import { Checkbox } from "@src/components/Checkbox";

import { useSpotTableVMProvider } from "./SpotTable/SpotTableVM";
import { RESIZE_TOOLTIP_CONFIG, TABLE_SIZES_CONFIG } from "./constants";

const useTooltipConfig = (isVisible: boolean, setIsVisible: React.Dispatch<React.SetStateAction<boolean>>): Config => ({
  ...RESIZE_TOOLTIP_CONFIG,
  visible: isVisible,
  onVisibleChange: setIsVisible,
});

export const TableActionButtons: React.FC = observer(() => {
  const vm = useSpotTableVMProvider();
  const { settingsStore } = useStores();

  const [isResizeTooltipVisible, setIsResizeTooltipVisible] = useState(false);
  const [isSettingsTooltipVisible, setIsSettingsTooltipVisible] = useState(false);

  const resizeTooltipConfig = useTooltipConfig(isResizeTooltipVisible, setIsResizeTooltipVisible);
  const settingsTooltipConfig = useTooltipConfig(isSettingsTooltipVisible, setIsSettingsTooltipVisible);

  const handleTableSize = (size: TRADE_TABLE_SIZE) => {
    settingsStore.setTradeTableSize(size);
    setIsResizeTooltipVisible(false);
  };

  const isAnySettingsChanged = false;

  const renderResizeTooltipContent = () => {
    return (
      <div>
        {TABLE_SIZES_CONFIG.map(({ size, icon, title }) => (
          <TableSize key={title} active={settingsStore.tradeTableSize === size} onClick={() => handleTableSize(size)}>
            <img alt={title} src={icon} />
            <SizedBox width={4} />
            <Text type={TEXT_TYPES.BUTTON} nowrap>
              {title.toUpperCase()}
            </Text>
          </TableSize>
        ))}
      </div>
    );
  };

  const renderSettingsTooltipContent = () => {
    return (
      <SettingsTooltipContainer>
        {/* <SmartFlex alignItems="flex-start" gap="12px" column>
          <Text type={TEXT_TYPES.BODY} secondary>
            Type
          </Text>
          <Checkbox checked>
            <Text type={TEXT_TYPES.BUTTON_SECONDARY} primary>
              MARKET
            </Text>
          </Checkbox>
          <Checkbox checked>
            <Text type={TEXT_TYPES.BUTTON_SECONDARY} primary>
              LIMIT
            </Text>
          </Checkbox>
        </SmartFlex> */}
        <SmartFlex alignItems="flex-start" gap="12px" column>
          <Text type={TEXT_TYPES.BODY} secondary>
            Side
          </Text>
          <Checkbox checked={vm.filterIsBuyOrderTypeEnabled} onChange={() => vm.toggleFilterOrderType(OrderType.Buy)}>
            <Text type={TEXT_TYPES.BUTTON_SECONDARY} primary>
              BUY
            </Text>
          </Checkbox>
          <Checkbox checked={vm.filterIsSellOrderTypeEnabled} onChange={() => vm.toggleFilterOrderType(OrderType.Sell)}>
            <Text type={TEXT_TYPES.BUTTON_SECONDARY} primary>
              SELL
            </Text>
          </Checkbox>
        </SmartFlex>
      </SettingsTooltipContainer>
    );
  };

  const renderResizeButton = () => {
    return (
      <Tooltip config={resizeTooltipConfig} content={renderResizeTooltipContent()}>
        <Icon isActive={isResizeTooltipVisible}>
          <TableSizeSelectorIcon onClick={() => setIsResizeTooltipVisible(true)} />
        </Icon>
      </Tooltip>
    );
  };

  const renderSettingsButton = () => {
    return (
      <Tooltip config={settingsTooltipConfig} content={renderSettingsTooltipContent()}>
        {isAnySettingsChanged && <GreenDot />}
        <Icon isActive={isSettingsTooltipVisible}>
          <TableSettingsIcon onClick={() => setIsSettingsTooltipVisible(true)} />
        </Icon>
      </Tooltip>
    );
  };

  return (
    <ActionContainer>
      {renderResizeButton()}
      {renderSettingsButton()}
    </ActionContainer>
  );
});

const ActionContainer = styled(SmartFlex)`
  gap: 12px;
  position: absolute;
  right: 12px;
  top: 4px;

  ${media.mobile} {
    display: none;
  }
`;

const TableSize = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 4px 12px;
  width: 100%;
  cursor: pointer;

  ${({ active, theme }) => active && `background: ${theme.colors.borderPrimary}`};

  :hover {
    background: ${({ theme }) => theme.colors.borderSecondary};
  }
`;

const SettingsTooltipContainer = styled(SmartFlex)`
  gap: 16px;
  padding: 0 16px 16px;
  position: relative;
`;

const GreenDot = styled.div`
  position: absolute;
  right: -3px;
  top: -3px;
  width: 8px;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.greenLight};
  border-radius: 8px;
`;

const Icon = styled(SmartFlex)<{ isActive: boolean }>`
  cursor: pointer;

  transition: color 250ms;
  color: ${({ theme, isActive }) => (isActive ? theme.colors.textPrimary : theme.colors.textDisabled)};
`;
