import styled from "@emotion/styled";

import Chip from "@components/Chip";
import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";
import { media } from "@themes/breakpoints";

export const TableText = styled(Text)`
  display: flex;
  align-items: center;
`;

export const TableContainer = styled(SmartFlex)`
  text-align: center;
  gap: 10px;
  height: 100%;
  width: 100%;
  padding: 32px;
  ${media.mobile} {
    padding: 16px;
  }
`;

export const CancelButton = styled(Chip)`
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary} !important;
`;

export const MobileTableOrderRow = styled(SmartFlex)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  padding: 11px 7px 14px 7px;
  background: ${({ theme }) => theme.colors.bgPrimary};

  position: relative;

  &:not(:last-of-type)::after {
    content: "";

    position: absolute;
    bottom: 0;
    width: 100%;

    height: 1px;
    box-shadow: inset 0 1px 0 0 ${({ theme }) => theme.colors.bgSecondary};
  }
`;

export const MobileTableRowColumn = styled(SmartFlex)`
  flex-direction: column;
  gap: 7px;

  &:last-of-type {
    align-items: flex-end;
  }
`;

export const TokenBadge = styled(SmartFlex)`
  padding: 4px 8px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 4px;

  ${Text} {
    line-height: 10px;
  }
`;

export const TextGraph = styled(Text)`
  text-transform: uppercase;

  ${media.desktop} {
    display: none;
  }
`;
