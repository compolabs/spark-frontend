import React from "react";

import SpotTableImpl, { SpotTableImplProps } from "./SpotTableImpl";
import { SpotTableVMProvider } from "./SpotTableVM";

const SpotTable: React.FC<SpotTableImplProps> = ({ isShowBalance }) => (
  <SpotTableVMProvider>
    <SpotTableImpl isShowBalance={isShowBalance} />
  </SpotTableVMProvider>
);

export default SpotTable;
