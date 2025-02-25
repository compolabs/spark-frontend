import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { media } from "@themes/breakpoints";

import { SpotTableImplProps } from "@screens/SpotScreen/BottomTables/SpotTable/SpotTableImpl.tsx";

import SpotTable from "./SpotTable";

const BottomTables: React.FC<SpotTableImplProps> = observer(({ isShowBalance }) => {
  return (
    <StyledBottomTables>
      <SpotTable isShowBalance={isShowBalance} />
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
