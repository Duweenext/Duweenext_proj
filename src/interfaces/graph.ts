// Generic types that can be used with any dataset keys
export type DatasetKey = string;
export type LegendKey = DatasetKey | "all";

export type AllDataSets<T extends string = DatasetKey> = Record<
  T,
  { label: string; data: number[]; color: (opacity?: number) => string }
>;

// Specific types for backwards compatibility
export type SalesDatasetKey = "sales" | "revenue";
export type SalesLegendKey = SalesDatasetKey | "all";

// Sensor data types
export type SensorDatasetKey = "pH" | "Temperature" | "EC";
export type SensorLegendKey = SensorDatasetKey | "all";
