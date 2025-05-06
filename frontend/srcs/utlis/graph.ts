// useGraphToggle.ts
import { useState } from "react";
import { DatasetKey, LegendKey, allDataSets } from "../interfaces/graph";

export function useGraphToggle() {
  const [selected, setSelected] = useState<Record<LegendKey, boolean>>({
    sales: true,
    revenue: true,
    all: true,
  });

  const toggleDataset = (key: LegendKey) => {
    setSelected((prev) => {
      // Case 1: Toggle "all"
      if (key === "all") {
        const allSelected = prev.all;

        if (allSelected) {
          // Case: all is already true → deselect everything
          return {
            sales: false,
            revenue: false,
            all: false,
          };
        } else {
          // Case: all was false → select everything
          return {
            sales: true,
            revenue: true,
            all: true,
          };
        }
      }

      // Case 2: Toggle individual dataset
      const updated = { ...prev, [key]: !prev[key], all: false };

      // Check if all individual datasets are now selected
      const allKeys: DatasetKey[] = ["sales", "revenue"];
      const allSelectedNow = allKeys.every(
        (k) => (k === key ? !prev[k] : prev[k]) // account for the toggled key
      );

      if (allSelectedNow) {
        updated.all = true;
      }

      return updated;
    });
  };

  const visibleDatasets = (
    allDataSets: allDataSets,
    selected: Record<LegendKey, boolean>
  ) => {
    const keys = selected.all
      ? (Object.keys(allDataSets) as DatasetKey[])
      : (Object.keys(allDataSets) as DatasetKey[]).filter(
          (key) => selected[key]
        );

    return keys.map((key) => ({
      data: allDataSets[key].data,
      color: allDataSets[key].color,
      strokeWidth: 3,
    }));
  };

  const legendLabels = (
    allDataSets: allDataSets,
    selected: Record<LegendKey, boolean>
  ) => {
    const keys = selected.all
      ? (Object.keys(allDataSets) as DatasetKey[])
      : (Object.keys(allDataSets) as DatasetKey[]).filter(
          (key) => selected[key]
        );

    return keys.map((key) => allDataSets[key].label);
  };

  return { selected, toggleDataset, visibleDatasets, legendLabels };
}
