import React, { useMemo } from "react";
import styled from "@emotion/styled";

import { PaginationButton } from "@components/Pagination/Pagination-button.tsx";
import { PaginationEntity } from "@components/Pagination/Pagination-entity.tsx";
import { SmartFlex } from "@components/SmartFlex.tsx";

import ArrowIcon from "@assets/icons/arrowUp.svg?react";

interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  showDots?: boolean;
  sibling?: number;
  onChange?: (page: PaginationProps["currentPage"]) => void;
  lengthData: number;
}

export const range = (start: number, end: number) => {
  return Array.from({ length: end - start + 1 }, (_, index) => index + start);
};

export const Pagination = ({ currentPage, onChange, lengthData }: PaginationProps) => {
  const pagination = useMemo(() => {
    return [currentPage]; // TODO: Заглушка пока нет выдачи paginationInfo с
    // const totalPageCount = Math.ceil(totalPages);
    // const totalPageNumbers = 6;
    //
    // if (totalPageNumbers >= totalPageCount) {
    //   return range(1, totalPageCount);
    // }
    //
    // const leftSiblingIndex = Math.max(currentPage - 1, 1);
    // const rightSiblingIndex = Math.min(currentPage + 1, totalPageCount);
    // const shouldShowLeftDots = leftSiblingIndex - 1 > sibling;
    // const shouldShowRightDots = rightSiblingIndex < totalPageCount - sibling;
    // const firstPageIndex = 1;
    // const lastPageIndex = totalPageCount;
    //
    // if (!shouldShowLeftDots && shouldShowRightDots) {
    //   const leftItemCount = 3 + sibling;
    //   const leftRange = range(1, leftItemCount);
    //   return [...leftRange, "...", totalPageCount];
    // }
    //
    // if (shouldShowLeftDots && !shouldShowRightDots) {
    //   const rightItemCount = 3 + sibling;
    //   const rightRange = range(totalPageCount - rightItemCount + 1, totalPageCount);
    //   return [firstPageIndex, "...", ...rightRange];
    // }
    //
    // if (shouldShowLeftDots && shouldShowRightDots) {
    //   const middleRange = range(leftSiblingIndex, rightSiblingIndex);
    //   return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
    // }
    //
    // return range(firstPageIndex, lastPageIndex);
  }, [currentPage]);

  const handleClick = (page: number) => {
    onChange?.(page);
  };

  // if (!totalPages) {
  //   return null;
  // }

  return (
    <SmartFlex alignItems="center" gap="16px" justifyContent="space-between">
      <PaginationButton disabled={currentPage === 1} onClick={() => handleClick(currentPage - 1)}>
        <ArrowIconStyled />
      </PaginationButton>
      {pagination.map((value, index) => {
        if (value.toString() === "...") {
          return (
            <PaginationEntity key={`dot-${index}`} disabled>
              <PaginationText>...</PaginationText>
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
            <PaginationText>{value}</PaginationText>
          </PaginationEntity>
        );
      })}
      <PaginationButton disabled={lengthData < 1} onClick={() => handleClick(currentPage + 1)}>
        <ArrowIconStyledRight />
      </PaginationButton>
    </SmartFlex>
  );
};

const ArrowIconStyled = styled(ArrowIcon)`
  transform: rotate(90deg);
`;

const ArrowIconStyledRight = styled(ArrowIcon)`
  transform: rotate(-90deg);
`;

const PaginationText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
