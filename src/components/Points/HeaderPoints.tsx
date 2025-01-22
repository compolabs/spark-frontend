import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { media } from "@themes/breakpoints";

import CloseIcon from "@assets/icons/close.svg?react";

import { POINTS_LINK, ROUTES } from "@constants";

const STORAGE_KEY = "v12-points-isPointsVisible";

export const HeaderPoints: React.FC = observer(() => {
  const [isPointsVisible, setIsPointsVisible] = useState<boolean>(() => {
    const storedValue = sessionStorage.getItem(STORAGE_KEY);
    return storedValue !== null ? JSON.parse(storedValue) : true;
  });

  const hidePoints = () => {
    setIsPointsVisible(false);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(false));
  };

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(isPointsVisible));
  }, [isPointsVisible]);

  if (!isPointsVisible) {
    return null;
  }

  return (
    <PointsContainer>
      <Text color="#000000" type={TEXT_TYPES.BODY}>
        Introducing <BoostRewardsText to={ROUTES.DASHBOARD}>Boost Rewards</BoostRewardsText>, earn $FUEL by providing
        liquidity.{" "}
        <ExternalLink href={POINTS_LINK} rel="noreferrer noopener" target="_blank">
          Learn More →
        </ExternalLink>
      </Text>
      <CloseIconStyled onClick={hidePoints} />
    </PointsContainer>
  );
});

const PointsContainer = styled(SmartFlex)`
  display: grid;
  grid-template-columns: 1fr 16px;
  gap: 8px;
  align-items: center;
  justify-content: center;

  padding: 0 16px;

  width: 100%;

  min-height: 32px;
  background-color: ${({ theme }) => theme.colors.greenStrong};

  & > :nth-of-type(1) {
    justify-self: center;
  }

  ${media.mobile} {
    padding: 8px 16px;
    min-height: 48px;
  }
`;

const BoostRewardsText = styled(Link)`
  ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}

  color: ${({ theme }) => theme.colors.fillBackground};

  font-weight: 600;

  text-decoration: underline;
  cursor: pointer;
`;

const CloseIconStyled = styled(CloseIcon)`
  path {
    fill: ${({ theme }) => theme.colors.fillBackground};
  }

  cursor: pointer;
`;

const ExternalLink = styled.a`
  ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}

  color: ${({ theme }) => theme.colors.blueVioletMedium};

  text-decoration: underline;
  cursor: pointer;
`;
