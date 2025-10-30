import { BackendSensorLogData, sensorLogScale } from '@/src/interfaces/sensor';

export const SLOT_COUNT: Record<sensorLogScale, number> = {
  all: 100,
  hour: 60,
  day: 24,
  week: 7,
  month: 30, // Using a fixed 30 for consistency
  year: 12,
};



export const sensorOption: sensorLogScale[] = ['all', 'hour', 'day', 'week', 'month', 'year'];

export function buildWindowDomain(d: Date, scale: sensorLogScale): { start: Date; end: Date } {
  const start = new Date(d);

  switch (scale) {
    case 'all': // 'all' case doesn't depend on local time, it's driven by API response
      start.setSeconds(0, 0);
      const endAll = new Date(start);
      endAll.setSeconds(start.getSeconds() + 1);
      return { start, end: endAll };
    case 'day':
      start.setHours(0, 0, 0, 0); // CHANGED
      const endDay = new Date(start);
      endDay.setDate(start.getDate() + 1); // CHANGED
      return { start, end: endDay };

    case 'hour':
      start.setMinutes(0, 0, 0); // CHANGED
      const endHour = new Date(start);
      endHour.setHours(start.getHours() + 1); // CHANGED
      return { start, end: endHour };


    case 'week':
      start.setHours(0, 0, 0, 0); // CHANGED
      const dayOfWeek = (start.getDay() + 6) % 7; // CHANGED: getDay() instead of getUTCDay()
      start.setDate(start.getDate() - dayOfWeek); // CHANGED
      const endWeek = new Date(start);
      endWeek.setDate(start.getDate() + 7); // CHANGED
      return { start, end: endWeek };

    case 'month':
      start.setHours(0, 0, 0, 0); // CHANGED
      start.setDate(1); // CHANGED
      const endMonth = new Date(start);
      endMonth.setMonth(start.getMonth() + 1); // CHANGED
      return { start, end: endMonth };

    case 'year':
      start.setHours(0, 0, 0, 0); // CHANGED
      start.setMonth(0, 1); // CHANGED
      const endYear = new Date(start);
      endYear.setFullYear(start.getFullYear() + 1); // CHANGED
      return { start, end: endYear };

    default:
      start.setHours(0, 0, 0, 0); // CHANGED
      const endDefault = new Date(start);
      endDefault.setDate(start.getDate() + 1); // CHANGED
      return { start, end: endDefault };
  }
}

export function addStep(d: Date, scale: sensorLogScale, n: number): Date {
  const x = new Date(d);
  if (scale === 'all') x.setMinutes(x.getMinutes() + n);
  else if (scale === 'minute') x.setMinutes(x.getMinutes() + n);
  else if (scale === 'hour') x.setHours(x.getHours() + n);
  else if (scale === 'day') x.setDate(x.getDate() + n);
  else if (scale === 'week') x.setDate(x.getDate() + 7 * n);
  else if (scale === 'month') x.setMonth(x.getMonth() + n);
  else if (scale === 'year') x.setFullYear(x.getFullYear() + n);
  return x;
}

export function makeSlots(start: Date, windowScale: sensorLogScale, n: number): Date[] {
  if (n <= 0) return [];
  const slots: Date[] = [];

  const getStepUnit = (scale: sensorLogScale): sensorLogScale => {
    switch (scale) {
      case 'hour': return 'minute';
      case 'day': return 'hour';
      case 'week': return 'day';
      case 'month': return 'day';
      case 'year': return 'month';
      default: return 'hour';
    }
  };

  const stepUnit = getStepUnit(windowScale);

  for (let i = 0; i < n; i++) {
    slots.push(addStep(start, stepUnit, i));
  }

  return slots;
}


export function formatLabel(d: Date, scale: sensorLogScale): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (scale === 'all') return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  if (scale === 'hour') return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (scale === 'day') return `${pad(d.getHours())}:00`;
  if (scale === 'week') return `${days[d.getDay()]} ${d.getDate()}`;
  if (scale === 'month') return `${pad(d.getDate())} ${months[d.getMonth()]}`;
  if (scale === 'year') return months[d.getMonth()];
  return d.toLocaleDateString();
}

export function pickY(sensorType: string, row: any) {
  if (sensorType === "Temperature") return row.temperature;
  if (sensorType === "EC") return row.ec;
  if (sensorType === "pH") return row.ph;
  return undefined;
}

export function binToSlots(
  sensorType: string,
  raw: BackendSensorLogData[] | undefined,
  slots: Date[]
): number[] {
  if (!raw || slots.length < 2) {
    // If there is only 1 slot, or no slots/data, return an array of zeros.
    return Array(slots.length).fill(0);
  }

  const out = new Array<number>(slots.length).fill(0);
  const cnt = new Array<number>(slots.length).fill(0);

  const t0 = slots[0].getTime();
  // THE FIX: Calculate step from the full range for better accuracy
  const step = slots[1].getTime() - t0;

  // Handle edge case where step is 0 (start and end are the same)
  if (step === 0) {
    // Average all values into the first slot
    let total = 0;
    let count = 0;
    for (const row of raw) {
      const y = Number(pickY(sensorType, row));
      if (Number.isFinite(y)) {
        total += y;
        count++;
      }
    }
    if (count > 0) {
      out[0] = total / count;
    }
    return out;
  }

  for (const row of raw) {
    const ts = new Date(row.created_at).getTime();
    const idx = Math.round((ts - t0) / step);
    if (idx >= 0 && idx < slots.length) {
      const y = Number(pickY(sensorType, row));
      if (Number.isFinite(y)) {
        out[idx] += y;
        cnt[idx] += 1;
      }
    }
  }

  return out.map((sum, i) => (cnt[i] > 0 ? sum / cnt[i] : 0));
}

export function makeSlotsFromRange(start: Date, end: Date, n: number): Date[] {
  if (n <= 0) return [];
  if (!start || !end) return [];

  const slots: Date[] = [];
  const startTime = start.getTime();
  const endTime = end.getTime();
  const duration = endTime - startTime;

  const step = n > 1 ? duration / (n - 1) : 0;

  for (let i = 0; i < n; i++) {
    slots.push(new Date(startTime + (step * i)));
  }
  return slots;
}