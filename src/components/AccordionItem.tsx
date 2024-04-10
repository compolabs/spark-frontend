import React from "react";
import styled from "@emotion/styled";
import { AccordionItem as RawAccordionItem } from "@szhsin/react-accordion";
import { AccordionItemProps } from "@szhsin/react-accordion/types/components/AccordionItem";

import { ReactComponent as ArrowIcon } from "@src/assets/icons/arrowUp.svg";
import { media } from "@src/themes/breakpoints";

type Props = {
  hideBottomBorder?: boolean;
} & AccordionItemProps;

const AccordionItem: React.FC<Props> = ({ header, ...rest }) => (
  <AccordionItemRoot
    {...rest}
    buttonProps={{
      className: ({ isEnter }) => `itemBtn ${isEnter && "itemBtnExpanded"}`,
    }}
    className="item"
    contentProps={{ className: "itemContent" }}
    header={
      <>
        {header}
        <ArrowIcon className="arrow" />
      </>
    }
    panelProps={{ className: "itemPanel" }}
  />
);

export default AccordionItem;

const AccordionItemRoot = styled(RawAccordionItem)<{ hideBottomBorder?: boolean }>`
  ${({ hideBottomBorder, theme }) =>
    hideBottomBorder ? "" : `border-bottom: 1px solid ${theme.colors.borderSecondary}`};
  padding: 12px 0;

  ${media.mobile} {
    padding: 8px 0;
  }

  :first-of-type {
    border-top: 1px solid ${({ theme }) => theme.colors.borderSecondary};
  }

  .itemBtn {
    cursor: pointer;
    display: flex;
    align-items: center;
    width: 100%;
    margin: 0px;
    padding: 4px 0;
    background-color: transparent;
    border: none;
  }

  .itemContent {
    transition: height 0.25s cubic-bezier(0, 0, 0, 1);
  }

  .itemPanel {
    box-sizing: border-box;
    padding-top: 4px;

    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .arrow {
    margin-left: auto;
    transition: transform 0.25s cubic-bezier(0, 0, 0, 1);
  }

  .itemBtn:hover .arrow {
    transform: rotate(-90deg);
  }

  .itemBtnExpanded .arrow {
    transform: rotate(-180deg) !important;
  }
`;
