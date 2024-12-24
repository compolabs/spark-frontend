import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { PaginationButton } from "@components/Pagination/Pagination-button";
import { PaginationEntity } from "@components/Pagination/Pagination-entity";
import { SmartFlex } from "@components/SmartFlex";

import ArrowIcon from "@assets/icons/arrowUp.svg?react";

interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  limit?: number;
  showDots?: boolean;
  sibling?: number;
  onChange?: (page: PaginationProps["currentPage"]) => void;
  lengthData: number;
}

export const range = (start: number, end: number) => {
  return Array.from({ length: end - start + 1 }, (_, index) => index + start);
};

export const Pagination = observer(({ currentPage, onChange, lengthData, limit = 10 }: PaginationProps) => {
  const totalPages = Math.ceil(lengthData / limit);
  const sibling = 1;
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
  }, [currentPage, lengthData, limit]);

  const handleClick = (page: number) => {
    onChange?.(page);
  };

  if (!totalPages) {
    return null;
  }

  return (
    <PaginationContainer>
      <SmartFlex alignItems="center" gap="16px" justifyContent="space-between">
        <PaginationButton disabled={currentPage === 1} onClick={() => handleClick(currentPage - 1)}>
          <ArrowIconStyled />
        </PaginationButton>
        {pagination.map((value, index) => {
          if (value.toString() === "...") {
            return (
              <PaginationEntity key={`dot-${index}`} disabled>
                <PaginationText current={false}>...</PaginationText>
              </PaginationEntity>
            );
          }

          return (
            <PaginationEntity
              key={index}
              disabled={currentPage === (value as number)}
              selected={currentPage === (value as number)}
              onClick={() => handleClick(value as number)}
            >
              <PaginationText current={currentPage === (value as number)}>{value}</PaginationText>
            </PaginationEntity>
          );
        })}
        <PaginationButton
          disabled={totalPages === 1 || totalPages === currentPage}
          onClick={() => handleClick(currentPage + 1)}
        >
          <ArrowIconStyledRight />
        </PaginationButton>
      </SmartFlex>
    </PaginationContainer>
  );
});

const ArrowIconStyled = styled(ArrowIcon)`
  transform: rotate(90deg);
`;

const ArrowIconStyledRight = styled(ArrowIcon)`
  transform: rotate(-90deg);
`;

const PaginationText = styled.span<{ current: boolean }>`
  font-size: 14px;
  color: ${({ theme, current }) => (current ? theme.colors.textPrimary : theme.colors.textSecondary)};
  &:hover {
    cursor: pointer;
  }
`;

const PaginationContainer = styled.div`
  height: 48px;
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 0px 0px 10px 10px;
  background: ${({ theme }) => theme.colors.bgSecondary};
`;
