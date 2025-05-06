export type DatasetKey = "sales" | "revenue";
export type LegendKey = DatasetKey | "all";

export type allDataSets = Record<
  DatasetKey,
  { label: string; data: number[]; color: (opacity?: number) => string }
>;
