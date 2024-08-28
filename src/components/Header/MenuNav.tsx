import React, { useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { AnimatePresence, motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { Nullable } from "tsdef";

import ArrowIcon from "@src/assets/icons/arrowUp.svg?react";
import SwapIcon from "@src/assets/icons/swap.svg?react";
import TradeIcon from "@src/assets/icons/switch.svg?react";
import { DOCS_LINK, GITHUB_LINK, ROUTES, TWITTER_LINK } from "@src/constants";
import { useMedia } from "@src/hooks/useMedia";
import { useOnClickOutside } from "@src/hooks/useOnClickOutside";
import { useStores } from "@src/stores";
import { media } from "@src/themes/breakpoints";
import { isExternalLink } from "@src/utils/isExternalLink";
import isRoutesEquals from "@src/utils/isRoutesEquals";

import { SmartFlex } from "../SmartFlex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "../Text";

type MenuChildItem = {
  title: string;
  desc: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  link: string;
};

type MenuItem = {
  title: string;
  link?: string;
  dataOnboardingKey?: string;
  children?: MenuChildItem[];
};

const MENU_ITEMS: Array<MenuItem> = [
  { title: "DASHBOARD" },
  {
    title: "TRADE",
    children: [
      {
        title: "SPOT",
        desc: "Advanced trading with order book and limit orders.",
        link: ROUTES.SPOT,
        icon: TradeIcon,
      },
      {
        title: "SWAP",
        desc: "Simple token exchange with instant trades.",
        link: ROUTES.SWAP,
        icon: SwapIcon,
      },
    ],
  },
  { title: "FAUCET", link: ROUTES.FAUCET, dataOnboardingKey: "mint" },
  { title: "DOCS", link: DOCS_LINK },
  { title: "GITHUB", link: GITHUB_LINK },
  { title: "TWITTER", link: TWITTER_LINK },
];

const DROPDOWN_VARIANTS = {
  open: {
    height: "auto",
    transition: {
      duration: 0.1,
    },
  },
  closed: {
    height: 0,
    transition: {
      duration: 0.1,
    },
  },
};

interface Props {
  isMobile?: boolean;
  onMenuClick?: () => void;
}

export const MenuNav: React.FC<Props> = observer(({ isMobile, onMenuClick }) => {
  const { mixPanelStore } = useStores();
  const media = useMedia();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<Nullable<string>>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const Element = isMobile ? Row : Tab;

  const handleMenuItemClick = () => {
    onMenuClick?.();
  };

  const handleClickOutside = () => {
    if (media.mobile) return;

    setOpenDropdown(null);
  };

  useOnClickOutside(dropdownRef, handleClickOutside);

  const renderChildMenuItem = ({ title, link, icon: Icon, desc }: MenuChildItem) => {
    const isActive = isRoutesEquals(link, location.pathname);

    return (
      <NavLink key={title} to={link} onClick={handleMenuItemClick}>
        <DropdownMenu isActive={isActive}>
          <Icon height={24} width={24} />
          <DropdownMenuContent>
            <DropdownMenuTitle>{title}</DropdownMenuTitle>
            <Text type={TEXT_TYPES.BODY}>{desc}</Text>
          </DropdownMenuContent>
        </DropdownMenu>
      </NavLink>
    );
  };

  const renderMenuItem = ({ title, link, dataOnboardingKey, children }: MenuItem) => {
    const dataOnboardingDeviceKey = `${dataOnboardingKey}-${isMobile ? "mobile" : "desktop"}`;

    const handleDropdownToggle = () => {
      setOpenDropdown(openDropdown === title ? null : title);
    };

    if (children) {
      const isDropdownOpen = openDropdown === title;

      const isAnyChildrenActive = children.some((item) => isRoutesEquals(item.link, location.pathname));

      const isActive = isDropdownOpen || isAnyChildrenActive;

      return (
        <DropdownContainer key={title} ref={dropdownRef}>
          <Element
            data-onboarding={dataOnboardingDeviceKey}
            isActive={isActive}
            isDropdown
            onClick={handleDropdownToggle}
          >
            <BaseGradientText>{title}</BaseGradientText>
            <ArrowIconStyled isOpen={isDropdownOpen} />
          </Element>
          <AnimatePresence mode="wait">
            {isDropdownOpen && (
              <Dropdown
                key="dropdown"
                animate="open"
                exit="closed"
                initial="closed"
                variants={DROPDOWN_VARIANTS}
                onClick={handleDropdownToggle}
              >
                {children.map(renderChildMenuItem)}
              </Dropdown>
            )}
          </AnimatePresence>
        </DropdownContainer>
      );
    }

    if (!link) return;

    if (isExternalLink(link)) {
      return (
        <a
          key={title}
          data-onboarding={dataOnboardingDeviceKey}
          href={link}
          rel="noopener noreferrer"
          target="_blank"
          onClick={() => mixPanelStore.trackEvent("desktopHeaderClick", { route: title })}
        >
          <Element>{title}</Element>
        </a>
      );
    }

    return (
      <NavLink key={title} data-onboarding={dataOnboardingDeviceKey} to={link} onClick={handleMenuItemClick}>
        <Element isActive={isRoutesEquals(link, location.pathname)}>{title}</Element>
      </NavLink>
    );
  };

  return MENU_ITEMS.map(renderMenuItem);
});

const ArrowIconStyled = styled(ArrowIcon)<{ isOpen?: boolean }>`
  width: 12px;
  height: 12px;
  transform: ${({ isOpen }) => (isOpen ? "rotate(180deg)" : "rotate(0deg)")};
  transition: transform 250ms ease;

  ${media.mobile} {
    width: 16px;
    height: 16px;
  }
`;

const Tab = styled(SmartFlex)<{ isActive?: boolean; isDropdown?: boolean }>`
  ${TEXT_TYPES_MAP[TEXT_TYPES.BUTTON_SECONDARY]}

  display: flex;
  align-items: center;
  gap: 4px;

  height: 32px;
  padding: 0 4px;

  font-weight: ${({ isActive }) => (isActive ? 700 : 500)};
  color: ${({ theme, isActive }) => (isActive ? theme.colors.textPrimary : theme.colors.textSecondary)};

  ${ArrowIconStyled} {
    & > path {
      fill: ${({ isActive, theme }) => (isActive ? theme.colors.textPrimary : theme.colors.textSecondary)};
    }
  }

  border-bottom: 2px solid ${({ theme, isActive }) => (isActive ? theme.colors.textPrimary : "transparent")};

  transition: border-bottom 400ms ease;

  cursor: pointer;
`;

const Row = styled(SmartFlex)<{ isActive?: boolean; isDropdown?: boolean }>`
  font-family: Space Grotesk;
  font-size: 16px;
  font-weight: 500;
  line-height: 16px;

  color: ${({ theme, isActive }) => (isActive ? theme.colors.textPrimary : theme.colors.textSecondary)};

  display: flex;
  align-items: center;
  gap: 4px;

  padding: 12px 32px;
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const Dropdown = styled(motion(SmartFlex))`
  position: absolute;
  top: 120%;
  left: 0;

  z-index: 10;

  padding: 8px 0;

  width: 265px;

  overflow: hidden;

  display: flex;
  flex-direction: column;

  border-radius: 10px;

  background-color: ${({ theme }) => theme.colors.bgSecondary};

  box-shadow:
    0px 4px 20px 0px #00000080,
    1px 1px 2px 0px #00000040;

  ${media.mobile} {
    position: unset;
    box-shadow: unset;
    padding: unset;
    height: 128px;
    width: 100%;
    gap: 8px;

    padding-top: 8px;
  }
`;

const BaseGradientText = styled.span`
  width: fit-content;

  background: linear-gradient(to right, #fff, #ff9b57, #54bb94);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const DropdownMenuTitle = styled(Text)`
  font-family: Space Grotesk;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
  text-transform: uppercase;

  color: ${({ theme }) => theme.colors.textPrimary};

  ${media.mobile} {
    font-size: 16px;
  }
`;

const DropdownMenu = styled(SmartFlex)<{ isActive?: boolean }>`
  padding: 8px 16px;
  gap: 8px;
  align-items: center;

  cursor: pointer;

  & > svg {
    min-width: 24px;
    min-height: 24px;
  }

  ${({ isActive, theme }) =>
    isActive &&
    css`
      background-color: #232323;

      ${DropdownMenuTitle} {
        width: fit-content;

        background: linear-gradient(to right, #fff, #ff9b57, #54bb94);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    `};

  &:hover {
    background-color: #232323;

    ${DropdownMenuTitle} {
      width: fit-content;

      background: linear-gradient(to right, #fff, #ff9b57, #54bb94);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  ${media.mobile} {
    padding: 4px 48px;
  }
`;

const DropdownMenuContent = styled(SmartFlex)`
  flex-direction: column;

  ${media.mobile} {
    gap: 4px;
  }
`;