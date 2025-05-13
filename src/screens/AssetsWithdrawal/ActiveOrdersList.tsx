import React from "react";
import { observer } from "mobx-react-lite";

import Button from "@components/Button";
import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";

import Spinner from "@assets/icons/spinner.svg?react";

import { getDeviceInfo } from "@utils/getDeviceInfo";

import { useOrders } from "./useOrders";

export const ActiveOrdersList: React.FC = observer(() => {
  const { activeOrders, cancelOrders, loading, canceling } = useOrders();
  const { isMobile } = getDeviceInfo();

  const hasOrders = Object.keys(activeOrders).length > 0;

  return (
    <SmartFlex gap="16px" margin="32px 0 0 0" width={isMobile ? "100%" : "45%"} column>
      <Text type="TEXT_BIG" primary>
        Active Orders
      </Text>
      {hasOrders ? (
        Object.entries(activeOrders).map(([marketId, orderIds]) => (
          <SmartFlex key={marketId} justifyContent="space-between" width="100%">
            <Text>{marketId}</Text>
            <Text>{orderIds.length} orders</Text>
          </SmartFlex>
        ))
      ) : loading ? (
        <SmartFlex justifyContent="center" width="100%">
          <Spinner height={32} />
        </SmartFlex>
      ) : (
        <SmartFlex justifyContent="center" width="100%">
          <Text>No active orders</Text>
        </SmartFlex>
      )}

      {hasOrders && (
        <SmartFlex>
          <Button disabled={canceling} onClick={cancelOrders}>
            {canceling ? <Spinner height={32} /> : "Cancel All Orders"}
          </Button>
        </SmartFlex>
      )}
    </SmartFlex>
  );
});
