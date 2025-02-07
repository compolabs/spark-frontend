export const filters = [
  {
    title: "24h",
    value: 24,
  },
  {
    title: "7d",
    value: 24 * 7,
  },
  {
    title: "30d",
    value: 24 * 30,
  },
  {
    title: "All Time",
    description: "A/T",
    value: 24 * 360,
  },
];

interface pnlTimeline {
  [key: string]: "total_pnl1" | "total_pnl7" | "total_pnl31";
}
export const pnlTimeline: pnlTimeline = {
  "24h": "total_pnl1",
  "7d": "total_pnl7",
  "30d": "total_pnl31",
};
