import React from "react";
import { useState } from "react";
import styled from "@emotion/styled";

import ModalSheet from "@components/ModalSheet";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { media } from "@themes/breakpoints";

import CloseIcon from "@assets/icons/close.svg?react";

import { useMedia } from "@hooks/useMedia";

import { isValidAmountInput } from "@utils/swapUtils";

// TODO: update fee numbers ?
const SLIPPAGE_PERCENTAGES = [0.5, 1, 1.5];

type SlippageSettingsProps = {
  onClose: () => void;
  saveSlippage: (percentage: number) => void;
};

interface ResolverDevice {
  children: React.ReactNode;
  handleClose: () => void;
}

const ResolverDevice = ({ children, handleClose }: ResolverDevice) => {
  const media = useMedia();
  return (
    <>
      {media.mobile ? (
        <ModalSheet isVisible={true} onClose={handleClose}>
          {children}
        </ModalSheet>
      ) : (
        <Overlay>{children}</Overlay>
      )}
    </>
  );
};

export const SlippageSettings: React.FC<SlippageSettingsProps> = ({ onClose, saveSlippage }) => {
  const [slippagePercentageInput, setSlippagePercentageInput] = useState("0");
  const [selectedPercent, setSelectedPercent] = useState<null | number>(null);
  const onChangeSlippage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlippageValue = e.target.value;
    if (!isValidAmountInput(newSlippageValue)) {
      return;
    }
    setSlippagePercentageInput(newSlippageValue);
  };

  return (
    <ResolverDevice handleClose={onClose}>
      <Container>
        <Header>
          <Text type={TEXT_TYPES.BUTTON} primary>
            Sleepage tolerance, %
          </Text>
          <CloseIconStyled onClick={onClose} />
        </Header>
        <Content>
          <SlippageInput
            autoComplete="off"
            id="slippage-input"
            placeholder="0.0%"
            type="text"
            value={slippagePercentageInput}
            onChange={onChangeSlippage}
          />
          <ButtonsContainer>
            {SLIPPAGE_PERCENTAGES.map((p) => (
              <PercentButton
                key={p}
                selected={p === selectedPercent}
                onClick={() => {
                  setSelectedPercent(p);
                  setSlippagePercentageInput(p.toString());
                }}
              >
                {p}
              </PercentButton>
            ))}
          </ButtonsContainer>
        </Content>
        <Text type={TEXT_TYPES.TEXT}>
          Maximum price slippage you’re willing to accept for your order to be executed, indicating the difference
          between expected and actual trade prices.
        </Text>
        <ConfirmButton
          disabled={Number(slippagePercentageInput) === 0}
          value={slippagePercentageInput}
          onClick={() => {
            saveSlippage(Number(slippagePercentageInput));
            onClose();
          }}
        >
          Confirm
        </ConfirmButton>
      </Container>
    </ResolverDevice>
  );
};

const CloseIconStyled = styled(CloseIcon)`
  width: 30px;
  height: 30px;
  padding: 8px;
  border-radius: 50px;
  &:hover {
    background: ${({ theme }) => theme.colors.bgIcon};
    cursor: pointer;
  }
`;
const Overlay = styled.div`
  position: absolute;
  bottom: calc(100% - 8px);
  right: 16px;
  box-shadow:
    0px 0px 14px -4px rgba(0, 0, 0, 0.2),
    0px 32px 48px -8px rgba(0, 0, 0, 0.35);

  ${media.mobile} {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background-color: ${({ theme }) => theme.colors.overlayBackground};
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    z-index: 1;
  }
`;

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 273px;

  ${media.mobile} {
    width: calc(100% - 16px);
    margin: 0 auto;
    z-index: 3;
    bottom: auto;
    right: auto;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Content = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SlippageInput = styled.input`
  border: 1px solid ${({ theme }) => theme.colors.bgSecondary};
  outline: none;
  background-color: ${({ theme }) => theme.colors.bgPrimary};
  width: 100px;
  color: white;
  padding: 11px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}

  &:focus,
  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.borderAccent};
  }
`;

const ConfirmButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.borderAccent};
  border-radius: 32px;
  padding: 12px 0;
  height: 38px;
  width: 100%;
  text-transform: uppercase;
  color: white;
  cursor: pointer;
  background-color: transparent;
  transition: all 0.2s ease;
  ${TEXT_TYPES_MAP[TEXT_TYPES.BUTTON]}
  ${media.mobile} {
    ${TEXT_TYPES_MAP[TEXT_TYPES.TEXT]}
    height: 54px;
  }

  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.borderAccent};
  }

  &:disabled {
    border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
    pointer-events: none;
    color: ${({ theme }) => theme.colors.borderPrimary};
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PercentButton = styled.div<{ selected: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.bgPrimary};
  border: 1px solid ${({ theme, selected }) => (selected ? theme.colors.borderAccent : theme.colors.borderSecondary)};
  ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}
  color: ${({ theme }) => theme.colors.textSecondary};
  width: 40px;
  height: 40px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.borderAccent};
  }
`;
