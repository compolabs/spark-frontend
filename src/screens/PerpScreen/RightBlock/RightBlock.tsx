import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import CreateOrder from "./CreateOrder";

const RightBlock: React.FC = observer(() => {
  return (
    <Root>
      <CreateOrder />
    </Root>
  );
});

export default RightBlock;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 273px;
  height: 100%;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.bgSecondary};
`;
