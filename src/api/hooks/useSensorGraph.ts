import { create } from "zustand";
// src/api/hooks/useSensorGraph.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { axiosMainInstance } from "@/src/api/apiManager";
import type { BackendSensorLogData } from "@/src/interfaces/sensor";

export function useSensorGraph(boardId: string, scale: string, endISO: string) {
    const { setGraph } = useSensorGraphStore();
    const key = `${boardId}:${scale}:${endISO}`;
    const [timeRange, setTimeRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });

    const getSensorGraphLog = useCallback(
        async (overrideDate?: string) => {
            const fetchEnd = overrideDate ?? endISO;
            const fetchKey = `${boardId}:${scale}:${fetchEnd}`;

            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const { data } = await axiosMainInstance.get(`/v1/sensors/${boardId}/sensor-logs/agg`, {
                params: { 
                    scale, 
                    end: fetchEnd, 
                    tz: userTimezone, 
                },
            });

            const rawData: BackendSensorLogData[] = data.data || [];
            const processedData = rawData.map(log => ({
                ...log,
                ec: log.ec * 100, 
            }));

            console.log("📊 Fetched and processed sensor graph data points:", processedData.length, data);

            setGraph(fetchKey, processedData);
            setTimeRange({ start: data.startTime, end: data.endTime });
            
            return processedData;
        },
        [boardId, scale, endISO, setGraph] 
    );

    const graphData = useSensorGraphStore((s) => s.graphs[key]);

    return { graphData, getSensorGraphLog, timeRange };
}


interface SensorGraphState {
    graphs: Record<string, BackendSensorLogData[]>;
    fetchStatus: Record<string, boolean>;
    setGraph: (key: string, data: BackendSensorLogData[]) => void;
    getGraph: (key: string) => BackendSensorLogData[] | undefined;
    clearGraph: (key: string) => void;
    setFetched: (key: string, value: boolean) => void;
    hasFetched: (key: string) => boolean;
}

export const useSensorGraphStore = create<SensorGraphState>((set, get) => ({
    graphs: {},
    fetchStatus: {},
    setGraph: (key, data) =>
        {
        set((state) => ({ graphs: { ...state.graphs, [key]: data } }))},
    getGraph: (key) => get().graphs[key],
    clearGraph: (key) =>
        set((state) => {
            const next = { ...state.graphs };
            delete next[key];
            return { graphs: next };
        }),
    setFetched: (key, value) =>
        set((state) => ({ fetchStatus: { ...state.fetchStatus, [key]: value } })),

    hasFetched: (key) => !!get().fetchStatus[key],
}));

import type { sensorLogScale } from "@/src/interfaces/sensor";

type WinKey = string;

export type ChartWindow = {
  scale: sensorLogScale;
  centerISO: string;          // anchor date-time for current frame
  startISO: string;           // computed window start
  endISO: string;             // computed window end
  slotsISO: string[];         // exactly 50 slot timestamps (x-axis)
};

type State = {
  windows: Record<WinKey, ChartWindow>;
  ensureWindow: (key: WinKey, w: ChartWindow) => void;
  setWindow: (key: WinKey, updater: (w: ChartWindow) => ChartWindow) => void;
  getWindow: (key: WinKey) => ChartWindow | undefined;
};

export const useChartWindowStore = create<State>((set, get) => ({
  windows: {},
  ensureWindow: (key, w) => {
    const cur = get().windows[key];
    if (!cur) set((s) => ({ windows: { ...s.windows, [key]: w } }));
  },
  setWindow: (key, updater) =>
    set((s) => {
      const cur = s.windows[key];
      if (!cur) return s;
      const next = updater(cur);
      return { windows: { ...s.windows, [key]: next } };
    }),
  getWindow: (key) => get().windows[key],
}));
