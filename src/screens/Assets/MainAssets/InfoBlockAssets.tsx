import React from "react";
import styled from "@emotion/styled";

import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import CloseIcon from "@src/assets/icons/close.svg?react";
import StartsIcon from "@src/assets/icons/starts.svg?react";
import { useStores } from "@stores";

export const InfoBlockAssets = () => {
  const { settingsStore } = useStores();

  const handleClose = () => {
    settingsStore.setIsShowDepositInfo(false);
  };

  return (
    <InfoContainer column>
      <div>
        <StartsIcon />
        <CloseIconAbsolute onClick={handleClose} />
      </div>
      <TextTitle color="primary" type={TEXT_TYPES.TITLE_MODAL}>
        Why do I have to deposit anything?
      </TextTitle>
      <TextInfo type={TEXT_TYPES.INFO}>
        Deposited assets stores on-chain in a smart-contract for quick order execution. Spark doesn’t store anything. We
        are not a CEX.
      </TextInfo>
    </InfoContainer>
  );
};

const TextInfo = styled(Text)`
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0.28px;
`;

const InfoContainer = styled(SmartFlex)`
  background: #1f1f1f;
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 8px;
  gap: 12px;
  position: relative;
`;

const CloseIconAbsolute = styled(CloseIcon)`
  position: absolute;
  right: 20px;
  top: 20px;
  &:hover {
    cursor: pointer;
  }
`;

const TextTitle = styled(Text)`
  width: 182px;
  line-height: 20px;
  letter-spacing: 0.32px;
`;