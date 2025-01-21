import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { media } from "@themes/breakpoints";

import PerpTable from "./PerpTable";

const BottomTables: React.FC = observer(() => {
  return (
    <StyledBottomTables>
      <PerpTable />
    </StyledBottomTables>
  );
});

export default BottomTables;

const StyledBottomTables = styled.div`
  width: 100%;
  border: 1px solid rgba(46, 46, 46, 1);
  border-radius: 8px;

  ${media.mobile} {
    flex-grow: 1;
  }
`;
