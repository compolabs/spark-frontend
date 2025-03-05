import React from "react";

import SpotTableImpl from "./SpotTableImpl";
import { SpotTableVMProvider } from "./SpotTableVM";

const SpotTable = () => (
  <SpotTableVMProvider>
    <SpotTableImpl />
  </SpotTableVMProvider>
);

export default SpotTable;
