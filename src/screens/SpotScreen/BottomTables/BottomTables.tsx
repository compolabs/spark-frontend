import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { media } from "@themes/breakpoints";

import BottomTablesSkeletonWrapper from "./BottomTablesSkeletonWrapper";
import SpotTable from "./SpotTable";

const BottomTables: React.FC = observer(() => {
  return (
    <BottomTablesSkeletonWrapper>
      <StyledBottomTables>
        <SpotTable />
      </StyledBottomTables>
    </BottomTablesSkeletonWrapper>
  );
});

export default BottomTables;

const StyledBottomTables = styled.div`
  width: 100%;

  ${media.mobile} {
    flex-grow: 1;
  }
`;
