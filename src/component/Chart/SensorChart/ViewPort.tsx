// hooks/useTimeSeriesViewport.ts
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { truncateToBucket, addStep, SLOT_COUNT } from '@/src/utils/chartUtils';
import { useSensor } from '@/src/api/hooks/useSensor';
import type { sensorLogScale, SensorDataBackend } from '@/src/interfaces/sensor';

type Viewport = { start: Date; end: Date };

export function useTimeSeriesViewport(boardId: string, sensor: SensorDataBackend, scale: sensorLogScale) {
  const { getSensorGraphLog, mergedGraph, clearMergedGraph } = useSensor(boardId, scale);

  // one source of truth for what the user is looking at
  const [viewport, setViewport] = useState<Viewport>(() => {
    const end = truncateToBucket(new Date(), scale);
    const count = SLOT_COUNT[scale];
    return { start: addStep(end, scale, -(count - 1)), end };
  });

  // fetch on viewport change – only missing buckets will be added by your existing merge logic
  useEffect(() => {
    const center = viewport.end; // use end as anchor for server "end" param
    const count = SLOT_COUNT[scale];
    getSensorGraphLog(center.toISOString(), scale, count);
  }, [boardId, scale, viewport.start.getTime(), viewport.end.getTime()]);

  // When scale changes, re-center viewport around the same middle date
  useEffect(() => {
    const middle = new Date((viewport.start.getTime() + viewport.end.getTime()) / 2);
    const anchor = truncateToBucket(middle, scale);
    const count = SLOT_COUNT[scale];
    setViewport({ start: addStep(anchor, scale, -(count - 1)), end: anchor });
    clearMergedGraph(scale); // let fresh data fill in (your merge logic will rebuild)
  }, [scale]);

  // Prefetch helpers (called when near edges in the chart)
  const prefetch = useCallback(async (side: 'left'|'right') => {
    const span = viewport.end.getTime() - viewport.start.getTime();
    const shiftMs = Math.max(span, 1);
    const count = SLOT_COUNT[scale];

    if (side === 'left') {
      const newEnd = new Date(viewport.start.getTime());
      await getSensorGraphLog(newEnd.toISOString(), scale, count);
    } else {
      const newEnd = new Date(viewport.end.getTime() + shiftMs);
      await getSensorGraphLog(newEnd.toISOString(), scale, count);
    }
  }, [viewport.start, viewport.end, scale, boardId]);

  // Build visible series from mergedGraph and viewport
  const series = useMemo(() => {
    if (!mergedGraph) return [];
    const startTs = viewport.start.getTime();
    const endTs = viewport.end.getTime();
    // x = timestamp (ms). y = value
    return mergedGraph
      .map(row => {
        const t = new Date((row as any).created_at ?? (row as any).timestamp ?? 0).getTime();
        const y =
          sensor.sensor_type === 'Temperature' ? Number(row.temperature) :
          sensor.sensor_type === 'EC'         ? Number(row.ec) :
          sensor.sensor_type === 'pH'         ? Number(row.ph) : undefined;
        return Number.isFinite(y) ? { x: t, y: y as number } : null;
      })
      .filter(Boolean)
      .filter(p => (p!.x >= startTs && p!.x <= endTs)) as {x:number; y:number}[];
  }, [mergedGraph, viewport, sensor.sensor_type]);

  // Provide min/max for y axis
  const yDomain = useMemo(() => {
    if (!series.length) return { min: 0, max: 1 };
    let min = Math.min(...series.map(p => p.y));
    let max = Math.max(...series.map(p => p.y));
    if (min === max) { min -= 1; max += 1; }
    return { min, max };
  }, [series]);

  return { viewport, setViewport, series, yDomain, prefetch };
}
