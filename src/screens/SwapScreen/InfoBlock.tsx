import React, { useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import SettingsIcon from "@src/assets/icons/gear.svg?react";
import Text, { TEXT_TYPES } from "@src/components/Text";
import { media } from "@src/themes/breakpoints";

import { SlippageSettings } from "./SlippageSettings";

interface InfoBlockProps {
  slippage: number;
  updateSlippage: (percent: number) => void;
}

export const InfoBlock: React.FC<InfoBlockProps> = ({ slippage, updateSlippage }) => {
  const theme = useTheme();
  const [isSlippageSettingOpen, setSlippageSettingOpen] = useState(false);

  return (
    <Root>
      <InfoLine>
        <Text type={TEXT_TYPES.BODY}>Slippage tolerance</Text>
        <LeftBlock>
          <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
            {slippage}%
          </Text>
          <Icon onClick={() => setSlippageSettingOpen(!isSlippageSettingOpen)} />
        </LeftBlock>
      </InfoLine>
      <InfoLine>
        <Text type={TEXT_TYPES.BODY}>Exchange fee</Text>
        <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
          0.00003 ETH (0,1$)
        </Text>
      </InfoLine>
      <InfoLine>
        <Text type={TEXT_TYPES.BODY}>Network fee</Text>
        <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
          0.0001 ETH (4$)
        </Text>
      </InfoLine>

      {isSlippageSettingOpen && (
        <SlippageSettings saveSlippage={updateSlippage} onClose={() => setSlippageSettingOpen(false)} />
      )}
    </Root>
  );
};

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  border-radius: 16px;
  background-color: #232323;
  padding: 16px 20px;
  width: 100%;
  position: relative;

  ${media.mobile} {
    position: static;
  }
`;

const InfoLine = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LeftBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Icon = styled(SettingsIcon)`
  cursor: pointer;
`;
