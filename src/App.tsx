import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";

import { Test } from "./Test";

const App: React.FC = observer(() => {
  return (
    <Root>
      <Test />
    </Root>
  );
});

export default App;

const Root = styled(Column)`
  width: 100%;
  align-items: center;
  height: 100vh;
`;
