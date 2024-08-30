import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { media } from "@src/themes/breakpoints";

import SpotTable from "./SpotTable";

const BottomTables: React.FC = observer(() => {
  const TableComponent = SpotTable;

  return (
    <StyledBottomTables>
      <TableComponent />
    </StyledBottomTables>
  );
});

export default BottomTables;

const StyledBottomTables = styled.div`
  width: 100%;

  ${media.mobile} {
    flex-grow: 1;
  }
`;
