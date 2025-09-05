// useGraphToggle.ts
import { useState } from "react";
import { AllDataSets } from "../interfaces/graph";

// Generic hook that can work with any dataset keys
export function useGraphToggle<T extends string>(datasetKeys: T[]) {
  type LegendKey = T | "all";
  
  // Initialize state with all datasets enabled
  const initialState = datasetKeys.reduce((acc, key) => {
    acc[key as T] = true;
    return acc;
  }, {} as Record<T, boolean>);
  
  const [selected, setSelected] = useState<Record<LegendKey, boolean>>({
    ...initialState,
    all: true,
  } as Record<LegendKey, boolean>);

  const toggleDataset = (key: LegendKey) => {
    setSelected((prev) => {
      // Case 1: Toggle "all"
      if (key === "all") {
        const allSelected = prev.all;

        if (allSelected) {
          // Case: all is already true → deselect everything
          const newState = datasetKeys.reduce((acc, k) => {
            acc[k as T] = false;
            return acc;
          }, {} as Record<T, boolean>);
          
          return {
            ...newState,
            all: false,
          } as Record<LegendKey, boolean>;
        } else {
          // Case: all was false → select everything
          const newState = datasetKeys.reduce((acc, k) => {
            acc[k as T] = true;
            return acc;
          }, {} as Record<T, boolean>);
          
          return {
            ...newState,
            all: true,
          } as Record<LegendKey, boolean>;
        }
      }

      // Case 2: Toggle individual dataset
      const updated = { ...prev, [key]: !prev[key], all: false };

      // Check if all individual datasets are now selected
      const allSelectedNow = datasetKeys.every(
        (k) => (k === key ? !prev[k as LegendKey] : prev[k as LegendKey])
      );

      if (allSelectedNow) {
        updated.all = true;
      }

      return updated;
    });
  };

  const visibleDatasets = (
    allDataSets: AllDataSets<T>,
    selected: Record<LegendKey, boolean>
  ) => {
    const keys = selected.all
      ? datasetKeys
      : datasetKeys.filter((key) => selected[key as LegendKey]);

    return keys.map((key) => ({
      data: allDataSets[key].data,
      color: allDataSets[key].color,
      strokeWidth: 3,
    }));
  };

  const legendLabels = (
    allDataSets: AllDataSets<T>,
    selected: Record<LegendKey, boolean>
  ) => {
    const keys = selected.all
      ? datasetKeys
      : datasetKeys.filter((key) => selected[key as LegendKey]);

    return keys.map((key) => allDataSets[key].label);
  };

  return { selected, toggleDataset, visibleDatasets, legendLabels };
}

// Backwards compatibility - specific hook for sales data
export function useSalesGraphToggle() {
  return useGraphToggle(['sales', 'revenue']);
}

// Specific hook for sensor data
export function useSensorGraphToggle() {
  return useGraphToggle(['pH', 'Temperature', 'EC']);
}
