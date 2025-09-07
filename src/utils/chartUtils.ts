import { sensorLogScale } from '@/src/interfaces/sensor';

export type ScrollMetrics = { x: number; w: number; cw: number };

export interface UseChartScrollProps {
  axisSlots: Date[];
  setAxisSlots: React.Dispatch<React.SetStateAction<Date[]>>;
  scale: sensorLogScale;
  spacing: number;
  getSensorGraphLog: (boardId: string, endTime: string, scale: sensorLogScale, count: number) => Promise<any>;
  boardId: string;
  setIsNavigating: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MAX_TOTAL_SLOTS = 150;
export const TRIM_AMOUNT = 30;
export const AGGRESSIVE_TRIM_THRESHOLD = 120;
export const EDGE_LEFT = 0.06;
export const EDGE_RIGHT = 0.94;

export const SLOT_COUNT: Record<sensorLogScale, number> = {
  all: 240, minute: 120, hour: 48, day: 14, week: 8, month: 24, year: 8,
};

export const SPACING_PER_SCALE: Record<sensorLogScale, number> = {
  all: 28,minute: 60, hour: 80, day: 100, week: 120, month: 140, year: 180,
};

export const sensorOption: sensorLogScale[] = ['all', 'minute', 'hour', 'day', 'week', 'month', 'year'];

export function truncateToBucket(d: Date, scale: sensorLogScale): Date {
  const x = new Date(d);
  if (scale === 'all') { x.setSeconds(0, 0); return x; }
  if (scale === 'minute') { x.setSeconds(0, 0); return x; }
  if (scale === 'hour') { x.setMinutes(0, 0, 0); return x; }
  if (scale === 'day') { x.setHours(0, 0, 0, 0); return x; }
  if (scale === 'week') { 
    x.setHours(0, 0, 0, 0); 
    const wd = (x.getDay() + 6) % 7; 
    x.setDate(x.getDate() - wd); 
    return x; 
  }
  if (scale === 'month') { x.setDate(1); x.setHours(0, 0, 0, 0); return x; }
  if (scale === 'year') { x.setMonth(0, 1); x.setHours(0, 0, 0, 0); return x; }
  return x;
}

export function addStep(d: Date, scale: sensorLogScale, n: number): Date {
  const x = new Date(d);
  if (scale === 'all') x.setSeconds(x.getSeconds() + n);
  else if (scale === 'minute') x.setMinutes(x.getMinutes() + n);
  else if (scale === 'hour') x.setHours(x.getHours() + n);
  else if (scale === 'day') x.setDate(x.getDate() + n);
  else if (scale === 'week') x.setDate(x.getDate() + 7 * n);
  else if (scale === 'month') x.setMonth(x.getMonth() + n);
  else if (scale === 'year') x.setFullYear(x.getFullYear() + n);
  return x;
}

export function formatLabel(d: Date, scale: sensorLogScale): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (scale === 'all')   return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (scale === 'minute') return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (scale === 'hour') return `${pad(d.getHours())}:00`;
  if (scale === 'day') return `${months[d.getMonth()]} ${d.getDate()}`;
  if (scale === 'week') return `Wk of ${months[d.getMonth()]} ${d.getDate()}`;
  if (scale === 'month') return `${months[d.getMonth()]} ${d.getFullYear()}`;
  if (scale === 'year') return `${d.getFullYear()}`;
  return d.toDateString();
}

export function formatCurrentDate(date: Date | null, scale: sensorLogScale): string {
    if (!date) return '';

    if (scale === 'hour' || scale === 'minute' || scale === 'all') {
      const dateOptions: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
      };

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };

      const datePart = date.toLocaleDateString('en-US', dateOptions);
      const timePart = date.toLocaleTimeString('en-US', timeOptions);

      return `${datePart} ${timePart}`;
    }

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    return date.toLocaleDateString('en-US', options);
}


// --- UTC-safe variants (new) ---
export function truncateToBucketUTC(d: Date, scale: sensorLogScale): Date {
  const x = new Date(d);
  if (scale === 'all') { x.setUTCSeconds(0, 0); return x; }
  if (scale === 'minute') { x.setUTCSeconds(0, 0); return x; }
  if (scale === 'hour') { x.setUTCMinutes(0, 0, 0); return x; }
  if (scale === 'day') { x.setUTCHours(0, 0, 0, 0); return x; }
  if (scale === 'week') {
    x.setUTCHours(0, 0, 0, 0);
    // Monday=0..Sunday=6
    const wd = (x.getUTCDay() + 6) % 7;
    x.setUTCDate(x.getUTCDate() - wd);
    return x;
  }
  if (scale === 'month') { x.setUTCDate(1); x.setUTCHours(0, 0, 0, 0); return x; }
  if (scale === 'year') { x.setUTCMonth(0, 1); x.setUTCHours(0, 0, 0, 0); return x; }
  return x;
}

export function addStepUTC(d: Date, scale: sensorLogScale, n: number): Date {
  const x = new Date(d);
  if (scale === 'all') x.setUTCMinutes(x.getUTCMinutes() + n);
  else if (scale === 'minute') x.setUTCMinutes(x.getUTCMinutes() + n);
  else if (scale === 'hour') x.setUTCHours(x.getUTCHours() + n);
  else if (scale === 'day') x.setUTCDate(x.getUTCDate() + n);
  else if (scale === 'week') x.setUTCDate(x.getUTCDate() + 7 * n);
  else if (scale === 'month') x.setUTCMonth(x.getUTCMonth() + n);
  else if (scale === 'year') x.setUTCFullYear(x.getUTCFullYear() + n);
  return x;
}
