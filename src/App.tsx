import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { SmartFlex } from "@components/SmartFlex";

import { Test } from "./Test";

const App: React.FC = observer(() => {
  return (
    <Root>
      <Test />
    </Root>
  );
});

export default App;

const Root = styled(SmartFlex)`
  width: 100%;
  align-items: center;
  background: ${({ theme }) => theme.colors.bgPrimary};
  height: 100vh;
`;
