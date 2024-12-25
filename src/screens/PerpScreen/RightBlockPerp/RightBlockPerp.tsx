import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import CreateOrderPerp from "./CreateOrderPerp";

const RightBlockPerp: React.FC = observer(() => {
  return (
    <Root>
      <CreateOrderPerp />
    </Root>
  );
});

export default RightBlockPerp;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 273px;
  height: 100%;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.bgSecondary};
`;
