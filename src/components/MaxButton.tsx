import styled from "@emotion/styled";

import Button from "@components/Button";
import { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { media } from "@themes/breakpoints";

const MaxButton = styled(Button)`
  padding: 0 8px !important;
  height: 20px !important;
  border-color: ${({ theme }) => theme.colors.borderSecondary};
  background: ${({ theme }) => theme.colors.bgPrimary};
  border-radius: 4px;
  ${TEXT_TYPES_MAP[TEXT_TYPES.SUPPORTING]};

  ${media.mobile} {
    height: 18px !important;
  }
`;
export default MaxButton;
