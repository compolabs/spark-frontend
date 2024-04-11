import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { useStores } from "@src/stores";
import { media } from "@src/themes/breakpoints";

import PerpTable from "./PerpTable";
import SpotTable from "./SpotTable";

const BottomTables: React.FC = observer(() => {
  const { tradeStore } = useStores();

  const TableComponent = tradeStore.isPerp ? PerpTable : SpotTable;

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
