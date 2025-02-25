import styled from "@emotion/styled";

export const ButtonNew = styled.button`
  height: 40;

  width: 100%;

  padding: 8px 12px;

  color: ${({ theme }) => theme.colors.fillSurface};
  background-color: ${({ theme }) => theme.colors.strokeAccent};
  border: 1px solid ${({ theme }) => theme.colors.strokeAccent};

  cursor: pointer;

  &:not(:disabled):hover {
    background: ${({ theme }) =>
      `linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), linear-gradient(0deg, ${theme.colors.strokeAccent}, ${theme.colors.strokeAccent})`};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.textIconTertiary};
    background-color: ${({ theme }) => theme.colors.fillSurface};
    border: 1px solid ${({ theme }) => theme.colors.strokeSecondary};
    cursor: not-allowed;
  }
`;
