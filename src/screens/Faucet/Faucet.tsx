import React, { useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import SizedBox from "@components/SizedBox";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import { useStores } from "@stores";
import { MIXPANEL_EVENTS } from "@stores/MixPanelStore";

import TokensFaucetTable from "@screens/Faucet/TokensFaucetTable";

import { ROUTES } from "@constants";

interface IProps {}

const Faucet: React.FC<IProps> = observer(() => {
  const { faucetStore, mixPanelStore, accountStore } = useStores();

  useEffect(() => {
    document.title = `Spark | Faucet`;
  }, []);

  useEffect(() => {
    mixPanelStore.trackEvent(MIXPANEL_EVENTS.PAGE_VIEW, {
      page_name: ROUTES.FAUCET,
      user_address: accountStore.address,
    });
  }, []);

  return (
    <Root>
      <Title type={TEXT_TYPES.H} primary>
        Faucet for Fuel Network
      </Title>
      <SizedBox height={16} />
      {faucetStore.faucetTokens.length === 0 ? (
        <Skeleton count={4} height={48} style={{ margin: 4 }} />
      ) : (
        <TokensFaucetTable />
      )}
    </Root>
  );
});

export default Faucet;

const Root = styled(SmartFlex)`
  flex-direction: column;
  padding: 0 16px;
  width: 100%;
  margin-bottom: 24px;
  margin-top: 40px;
  text-align: left;

  ${media.desktop} {
    margin-top: 56px;
  }
`;

const Title = styled(Text)`
  ${media.mobile} {
    text-align: center;
  }
`;
