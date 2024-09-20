import React, { useMemo } from "react";
import { PaginationButton } from "@components/Pagination-button.tsx";
import ArrowIcon from "@src/assets/icons/arrowUp.svg?react";
import styled from "@emotion/styled";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  showDots?: boolean;
  sibling?: number;
  onChange?: (page: PaginationProps["currentPage"]) => void;
}

export const range = (start: number, end: number) => {
  return Array.from({ length: end - start + 1 }, (_, index) => index + start);
};

export const Pagination = ({ currentPage, totalPages, showDots = true, sibling = 2, onChange }: PaginationProps) => {
  const pagination = useMemo(() => {
    const totalPageCount = Math.ceil(totalPages);
    const totalPageNumbers = 6;

    if (totalPageNumbers >= totalPageCount) {
      return range(1, totalPageCount);
    }

    const leftSiblingIndex = Math.max(currentPage - 1, 1);
    const rightSiblingIndex = Math.min(currentPage + 1, totalPageCount);
    const shouldShowLeftDots = leftSiblingIndex - 1 > sibling;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - sibling;
    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + sibling;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, "...", totalPageCount];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + sibling;
      const rightRange = range(totalPageCount - rightItemCount + 1, totalPageCount);
      return [firstPageIndex, "...", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
    }

    return range(firstPageIndex, lastPageIndex);
  }, [totalPages, currentPage]);

  const handleClick = (page: number) => {
    onChange?.(page);
  };

  if (!totalPages) {
    return null;
  }

  return (
    <div className="ui-flex ui-gap-[8px]" data-testid="pagination">
      <PaginationButton
        data-testid="changePreviousPage"
        disabled={currentPage === 1}
        onClick={() => handleClick(currentPage - 1)}
      >
        <ArrowIconStyled />
      </PaginationButton>
      {pagination.map((value, index) => {
        if (value === "...") {
          return (
            <PaginationButton key={`dot-${index}`} disabled>
              <span>...</span>
            </PaginationButton>
          );
        }

        return (
          <PaginationButton
            key={index}
            selected={currentPage === (value as number)}
            // disabled={currentPage === (value as number)}
            // onClick={() => handleClick(value as number)}
            // data-testid={`changePage_${value}`}
          >
            <span>{value}</span>
          </PaginationButton>
        );
      })}
      <PaginationButton
        disabled={currentPage === totalPages}
        // onClick={() => handleClick(currentPage + 1)}
        // data-testid="changeNextPage"
      >
        {/*<IconChevronRight className="ui-m-auto ui-scale-50" />*/}
      </PaginationButton>
    </div>
  );
};

const ArrowIconStyled = styled(ArrowIcon)`
  transform: rotate(90deg);
  color: wheat;
  fill: red;
`;
