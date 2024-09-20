import React, { useEffect } from "react";
import styled from "@emotion/styled";

import Button from "@components/Button";
import Loader from "@components/Loader";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";

import { DOCS_LINK, TWITTER_LINK } from "@constants";

const UnderConstruction: React.FC = () => {
  useEffect(() => {
    document.title = `Spark | Work in progress...`;
  }, []);

  return (
    <SmartFlex gap="16px" width="100%" center column>
      <LoaderStyled hideText />
      <Text type={TEXT_TYPES.H} primary>
        🛠️ Website Under Maintenance 🛠️
      </Text>
      <SmartFlex gap="12px" center column>
        <Text type={TEXT_TYPES.BODY} secondary>
          Our website is currently undergoing maintenance.
        </Text>
        <Text type={TEXT_TYPES.BODY} secondary>
          We are working hard to fix the current issues and improve the site.
        </Text>
        <Text type={TEXT_TYPES.BODY} secondary>
          Please check back later. We will let you know as soon as everything is ready!
        </Text>
      </SmartFlex>
      <SmartFlex gap="16px" center>
        <a href={TWITTER_LINK} rel="noreferrer noopener" target="_blank">
          <Button green>Twitter</Button>
        </a>
        <a href={DOCS_LINK} rel="noreferrer noopener" target="_blank">
          <Button green>Docs</Button>
        </a>
      </SmartFlex>
    </SmartFlex>
  );
};

export default UnderConstruction;

const LoaderStyled = styled(Loader)`
  height: fit-content;
`;
