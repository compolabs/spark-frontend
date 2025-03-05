import styled from "@emotion/styled";

import Text, { TEXT_TYPES_MAP } from "@components/Text";
import { media } from "@themes/breakpoints";

const Chip = styled(Text)`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 20px;
  min-height: 18px;
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.bgSecondary};
  padding: 0 4px;
  max-width: fit-content;
  box-sizing: border-box;
  ${TEXT_TYPES_MAP.SUPPORTING};

  ${media.mobile} {
    height: 18px;
  }
`;

export default Chip;
