export interface MarketAttributeProps {
  title: string;
  value: string;
  period?: string;
  change: {
    value: string;
    percentage: string;
    direction: string;
  };
  icon?: string;
  isSelect: boolean;
  onClick: () => void;
}
export interface MarketDataProps {
  attributes: Omit<MarketAttributeProps, "isSelect" | "onClick">[];
}