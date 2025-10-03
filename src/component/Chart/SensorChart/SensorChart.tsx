import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { SensorDataBackend, sensorLogScale } from '@/src/interfaces/sensor';
import { useSensor } from '@/src/api/hooks/useSensor';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { themeStyle } from '@/src/theme';
import RowButtonGroup from '../../Buttons/ButtonFilter';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { getSensorSuffix } from '../../Card/CardSensorPrimary/SensorBoardExpand';
import {
  addStep, formatCurrentDate, formatLabel, truncateToBucket,
  AGGRESSIVE_TRIM_THRESHOLD,
  EDGE_LEFT, EDGE_RIGHT, MAX_TOTAL_SLOTS, ScrollMetrics,
  sensorOption, SLOT_COUNT, SPACING_PER_SCALE, TRIM_AMOUNT,
  truncateToBucketUTC, addStepUTC
} from '@/src/utils/chartUtils';
import { useTranslation } from 'react-i18next';



type SensorChartProp = { boardId: string; sensor: SensorDataBackend };

export default function SensorChart({ boardId, sensor }: SensorChartProp) {
  const [scale, setScale] = useState<sensorLogScale>('day');
  const [axisSlots, setAxisSlots] = useState<Date[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const isAndroid = Platform.OS === 'android';
  const needsDateTime = (scale: sensorLogScale) =>
    scale === 'minute' || scale === 'hour' || scale === 'all';

  const {t} = useTranslation();

  const spacing = useMemo(() => SPACING_PER_SCALE[scale], [scale]);

  const { getSensorGraphLog, mergedGraph, clearMergedGraph } = useSensor(boardId, scale);

  const scrollRef = useRef<any>(null);
  const metricsRef = useRef<ScrollMetrics>({ x: 0, w: 1, cw: 1 });
  const cooldown = useRef(0);
  const isExtending = useRef(false);
  const isFlingingRef = useRef(false);
  const scrollIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollX = useRef(0);
  const fetchVersionRef = useRef(0);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isJumpingToDate, setIsJumpingToDate] = useState(false);
  const jumpingRef = useRef(false);

  // console.log('Merged graph:', mergedGraph);
  const fetchGraphLog = async (end: Date, count: number) => {
    const v = ++fetchVersionRef.current; // bump version for this fetch
    try {
      await getSensorGraphLog(end.toISOString(), scale, count);
      // Only accept this fetch if still current
      if (fetchVersionRef.current !== v) return;
      setIsInitialized(true);
    } catch (err) {
      if (fetchVersionRef.current !== v) return; // ignore stale error
      console.error('❌ load failed:', err);
    }
  }

  useEffect(() => {
    if (!mergedGraph?.length) return;
    const newest = mergedGraph.reduce<Date>((a, r) => {
      const t = new Date(r.created_at);
      return t > a ? t : a;
    }, new Date(0));
    const target = truncateToBucketUTC(new Date(newest), scale);
    const count = SLOT_COUNT[scale];
    const start = addStepUTC(target, scale, -Math.floor(count / 2));
    setAxisSlots(Array.from({ length: count }, (_, i) => addStepUTC(start, scale, i)));
  }, [mergedGraph, scale]);

  useEffect(() => {
    const end = truncateToBucketUTC(new Date(), scale);
    const count = SLOT_COUNT[scale];
    const start = addStepUTC(end, scale, -(count - 1));
    const init = Array.from({ length: count }, (_, i) => addStepUTC(start, scale, i));

    setAxisSlots(init);
    setIsInitialized(false);

    fetchGraphLog(end, count);

  }, [boardId, getSensorGraphLog]);

  useEffect(() => {
    if (!isInitialized || axisSlots.length === 0) return;
    if (isJumpingToDate || jumpingRef.current) return;

    const currentCenter = axisSlots[Math.floor(axisSlots.length / 2)];
    const truncatedCenter = truncateToBucketUTC(currentCenter, scale);

    const count = SLOT_COUNT[scale];
    const newStart = addStepUTC(currentCenter, scale, -Math.floor(count / 2));
    const newSlots = Array.from({ length: count }, (_, i) => addStep(newStart, scale, i));

    setAxisSlots(newSlots);

    fetchGraphLog(truncatedCenter, count);
  }, [scale]);

  const getCurrentDateFromScroll = useCallback((): Date | null => {
    const { x, w, cw } = metricsRef.current;
    if (!cw || !w || !axisSlots.length) return null;

    const viewportCenter = x + (w / 2);
    const totalWidth = axisSlots.length * spacing;
    const progressRatio = Math.max(0, Math.min(1, viewportCenter / totalWidth));
    const slotIndex = Math.floor(progressRatio * axisSlots.length);
    const clampedIndex = Math.max(0, Math.min(slotIndex, axisSlots.length - 1));

    return axisSlots[clampedIndex] || null;
  }, [axisSlots, spacing]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const x = contentOffset?.x ?? 0;
    const w = layoutMeasurement?.width ?? 1;
    const cw = contentSize?.width ?? 1;

    // detect movement
    const dx = Math.abs(x - lastScrollX.current);
    lastScrollX.current = x;

    // if we see movement, consider it "flinging" until idle
    if (dx > 0.5) {
      isFlingingRef.current = true;
    }

    // reset / start idle timer (fires when scrolling pauses)
    if (scrollIdleTimer.current) clearTimeout(scrollIdleTimer.current);
    scrollIdleTimer.current = setTimeout(() => {
      isFlingingRef.current = false;
    }, 120); // 100–150ms works well

    metricsRef.current = { x, w, cw };
  }, []);

  const extendLeft = useCallback(async () => {
    if (isExtending.current) return;
    isExtending.current = true;

    try {
      const count = SLOT_COUNT[scale];
      if (!axisSlots.length) return;

      const left = axisSlots[0];
      const newStart = addStep(left, scale, -count);
      const newSlots = Array.from({ length: count }, (_, i) => addStep(newStart, scale, i));
      const dx = count * spacing;

      setAxisSlots(prev => {
        const newAxisSlots = [...newSlots, ...prev];

        if (newAxisSlots.length > AGGRESSIVE_TRIM_THRESHOLD) {
          const trimmed = newAxisSlots.slice(0, -(TRIM_AMOUNT + 20));
          if (!isFlingingRef.current) {
            requestAnimationFrame(() => {
              scrollRef.current?.scrollTo({ x: (metricsRef.current.x + dx), animated: false });
            });
          }
          return trimmed;
        } else if (newAxisSlots.length > MAX_TOTAL_SLOTS) {
          const trimmed = newAxisSlots.slice(0, -TRIM_AMOUNT);
          if (!isFlingingRef.current) {
            requestAnimationFrame(() => {
              scrollRef.current?.scrollTo({ x: (metricsRef.current.x + dx), animated: false });
            });
          }
          return trimmed;
        }

        return newAxisSlots;
      });

      if (!isFlingingRef.current) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ x: (metricsRef.current.x + dx), animated: false });
        });
      }

      console.log('Extending left to:', left.toISOString());

      await getSensorGraphLog(left.toISOString(), scale, count);
    } finally {
      isExtending.current = false;
    }
  }, [axisSlots, scale, boardId, spacing]);

  const extendRight = useCallback(async () => {
    if (isExtending.current) return;
    isExtending.current = true;

    try {
      const count = SLOT_COUNT[scale];
      if (!axisSlots.length) return;

      const right = axisSlots[axisSlots.length - 1];
      const firstNew = addStep(right, scale, 1);
      const newEnd = addStep(right, scale, count);
      const newSlots = Array.from({ length: count }, (_, i) => addStep(firstNew, scale, i));

      setAxisSlots(prev => {
        const newAxisSlots = [...prev, ...newSlots];

        if (newAxisSlots.length > AGGRESSIVE_TRIM_THRESHOLD) {
          const trimAmount = TRIM_AMOUNT + 20;
          const trimmed = newAxisSlots.slice(trimAmount);

          if (!isFlingingRef.current) {
            const adjustedX = metricsRef.current.x - (trimAmount * spacing);
            requestAnimationFrame(() => {
              scrollRef.current?.scrollTo({ x: Math.max(0, adjustedX), animated: false });
            });
          }
          return trimmed;
        } else if (newAxisSlots.length > MAX_TOTAL_SLOTS) {
          const trimmed = newAxisSlots.slice(TRIM_AMOUNT);

          if (!isFlingingRef.current) {
            const adjustedX = metricsRef.current.x - (TRIM_AMOUNT * spacing);
            requestAnimationFrame(() => {
              scrollRef.current?.scrollTo({ x: Math.max(0, adjustedX), animated: false });
            });
          }
          return trimmed;
        }

        return newAxisSlots;
      });

      console.log('Extending right to:', newEnd.toISOString());
      await getSensorGraphLog(newEnd.toISOString(), scale, count);
    } finally {
      isExtending.current = false;
    }
  }, [axisSlots, scale, boardId, spacing]);

  const onScrollEnd = useCallback((e?: NativeSyntheticEvent<NativeScrollEvent>) => {
    const now = Date.now();
    if (now < cooldown.current || isExtending.current) return;

    if (e?.nativeEvent) {
      const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
      metricsRef.current = {
        x: contentOffset?.x ?? 0,
        w: layoutMeasurement?.width ?? 1,
        cw: contentSize?.width ?? 1,
      };
    }

    const { x, w, cw } = metricsRef.current;
    if (!cw || !w) return;

    const leftRatio = x / cw;
    const rightRatio = (x + w) / cw;

    if (leftRatio < EDGE_LEFT) {
      extendLeft();
      cooldown.current = now + 700;   // was 500
    } else if (rightRatio > EDGE_RIGHT) {
      extendRight();
      cooldown.current = now + 700;
    }
  }, [extendLeft, extendRight]);

  const pickY = useCallback((row: any) => {
    switch (sensor.sensor_type) {
      case 'Temperature': return row.temperature;
      case 'EC': return row.ec;
      case 'pH': return row.ph;
      default: return undefined;
    }
  }, [sensor.sensor_type]);

  const sums = useMemo(() => {
    const m = new Map<number, { sum: number; c: number }>();
    (mergedGraph ?? []).forEach(row => {
      const b = truncateToBucketUTC(new Date(row.created_at), scale).getTime(); // <— use UTC
      const y = Number(pickY(row));
      if (!Number.isFinite(y)) return;
      const acc = m.get(b) ?? { sum: 0, c: 0 };
      acc.sum += y; acc.c += 1;
      m.set(b, acc);
    });
    return m;
  }, [mergedGraph, scale, pickY]);

  const points = useMemo(() => {
    return axisSlots.map(slot => {
      const key = slot.getTime();
      const acc = sums.get(key);
      const y = acc ? acc.sum / acc.c : 0;
      const roundedValue = Math.round(y * 100) / 100;

      return {
        value: roundedValue,
        label: formatLabel(slot, scale),
        dataPointText: roundedValue > 0 ? `${roundedValue}` : '',
      };
    });
  }, [axisSlots, sums, scale]);

  const { maxValue } = useMemo(() => {
    const ys = points.map(p => p.value);
    let min = Math.min(...ys), max = Math.max(...ys);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return { minValue: 0, maxValue: 1 };
    if (min === max) { min -= 1; max += 1; }
    return { minValue: Math.floor(min), maxValue: Math.ceil(max * 2) };
  }, [points]);

  const handleScaleChange = useCallback((value: sensorLogScale) => {
    setScale((prev) => {
      if (prev !== value) {
        fetchVersionRef.current++;
        clearMergedGraph(prev);
      }
      return value;
    });
  }, []);

  if (__DEV__ && scale === 'all') {
    const first5 = axisSlots.slice(0, 5).map(d => d.toISOString());
    const hits = axisSlots.slice(0, 60).filter(d => sums.has(d.getTime())).length;
    console.log('ALL probe slots=', first5, 'hits in first 60s=', hits);
  }

  const scaleButtons = useMemo(() => {
    return sensorOption.map(option => ({
      id: option,
      label: option.toUpperCase(),
      value: t(option),
      color: '#f5f5f5',
      focusColor: '#1A736A',
      textColor: '#666',
      focusTextColor: '#ffffff',
      onPress: handleScaleChange
    }));
  }, [handleScaleChange]);

  const currentDate = getCurrentDateFromScroll();

  const jumpToDate = useCallback(async (targetDate: Date) => {
    if (jumpingRef.current || isJumpingToDate) return;

    jumpingRef.current = true;
    setIsJumpingToDate(true);

    try {
      // 1) UTC truncate to align buckets (works for minute/hour/day/week/month/year)
      const truncatedTarget = truncateToBucketUTC(targetDate, scale);

      // 2) Build centered slots (UTC)
      const count = SLOT_COUNT[scale];
      const start = addStepUTC(truncatedTarget, scale, -Math.floor(count / 2));
      const newSlots = Array.from({ length: count }, (_, i) => addStepUTC(start, scale, i));
      setAxisSlots(newSlots);

      // 3) Fetch
      await getSensorGraphLog(truncatedTarget.toISOString(), scale, count);

      // 4) Center the scroll after layout is ready (avoid NaN)
      const centerAndScroll = () => {
        const w = metricsRef.current.w || 0;
        if (w <= 0) {
          // try again on next frame when width is known
          requestAnimationFrame(centerAndScroll);
          return;
        }
        const targetIndex = Math.floor(count / 2);
        const x = targetIndex * spacing - w / 2;
        if (Number.isFinite(x) && x >= 0) {
          scrollRef.current?.scrollTo?.({ x, animated: true });
        }
      };
      requestAnimationFrame(centerAndScroll);

    } catch (error) {
      console.error('jumpToDate error:', error);
    } finally {
      setIsJumpingToDate(false);
      jumpingRef.current = false;
    }
  }, [boardId, scale, spacing, getSensorGraphLog, isJumpingToDate]);

  function openAndroidDateTime(initial: Date, cb: (finalDate: Date) => void) {
    DateTimePickerAndroid.open({
      value: initial,
      mode: 'date',
      onChange: (_e, d) => {
        if (!d) return; // dismissed
        const pickedDate = d;
        DateTimePickerAndroid.open({
          value: initial,
          mode: 'time',
          is24Hour: false,         // set true if you prefer
          onChange: (_e2, t) => {
            if (!t) return;       // dismissed
            const final = new Date(
              pickedDate.getFullYear(), pickedDate.getMonth(), pickedDate.getDate(),
              t.getHours(), t.getMinutes(), 0, 0
            );
            cb(final);
          },
        });
      },
    });
  }

  return (
    <View style={style.container}>
      <View style={style.container_header}>
        <Text style={style.title}>{t('Summary Graph of')} {t(sensor.sensor_type)}</Text>
        <TouchableOpacity
          style={style.datePickerButton}
          onPress={() => {
            if (isAndroid && needsDateTime(scale)) {
              // Android + minute/hour/all → two-step
              openAndroidDateTime(selectedDate, (finalDate) => {
                setSelectedDate(finalDate);
                jumpToDate(finalDate);
              });
            } else {
              // iOS (supports 'datetime') OR Android date-only scales
              setShowDatePicker(true);
            }
          }}
          disabled={isJumpingToDate}
        >
          <MaterialIcons name="date-range" size={15} color="black" />
          <Text style={style.datePickerText}>
            {isJumpingToDate ? 'Loading...' : selectedDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              ...(scale === 'hour' || scale === 'minute' ? {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              } : {})
            })}
          </Text>
        </TouchableOpacity>

        <RowButtonGroup
          buttons={scaleButtons}
          defaultSelected={scale}
          gap={6}
          buttonStyle={{ paddingHorizontal: 12, paddingVertical: 6 }}
          scrollable={true}
        />
      </View>

      <View style={style.chartContainer}>
        <View style={{ overflow: 'hidden' }}>
          <LineChart
            data={points}

            height={220}
            initialSpacing={0}
            spacing={spacing}
            xAxisThickness={2}
            yAxisLabelSuffix={getSensorSuffix(sensor.sensor_type)}
            yAxisThickness={2}
            hideRules={false}
            xAxisLabelTextStyle={{ fontSize: 10 }}
            yAxisTextStyle={{ fontSize: 10 }}
            maxValue={maxValue}
            scrollEventThrottle={16}
            onScroll={onScroll}
            // onScrollEndDrag={onScrollEnd}
            onMomentumScrollEnd={onScrollEnd}
            showVerticalLines
            scrollRef={scrollRef as any}
            showValuesAsDataPointsText={points.length <= 24}
            // curved
            dataPointsColor="#1A736A"
            dataPointsRadius={4}
            dataPointsWidth={2}
            stripHeight={180}
            stripWidth={2}
            stripColor="#FF4444"
            stripOpacity={0.8}
            textFontSize={14}
            textShiftY={-15}
            textShiftX={-8}
            // showValuesAsDataPointsText={false}
            curved={false}
            lineGradient
            animateOnDataChange={false}
            scrollAnimation={false}
          // lineGradient
          // animateOnDataChange
          // scrollAnimation
          // animationDuration={10}
          />
        </View>

        <View style={style.centerLineContainer} pointerEvents="none">
          <View style={style.centerLine} />
        </View>

        <View style={style.dateDisplayContainer} pointerEvents="none">
          <View style={style.dateDisplay}>
            <Text style={style.currentDate}>
              {formatCurrentDate(currentDate, scale)}
            </Text>
          </View>
        </View>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode={needsDateTime(scale) ? 'datetime' : 'date'} // iOS can do 'datetime'; Android non-datetime stays 'date'
          display="default"
          onChange={(event, date) => {
            if (Platform.OS === 'android') setShowDatePicker(false);

            if (event.type === 'set' && date) {
              setSelectedDate(date);
              if (Platform.OS === 'ios') setShowDatePicker(false);
              jumpToDate(date);
            } else if (event.type === 'dismissed') {
              setShowDatePicker(false);
            }
          }}
        />
      )}
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 40,
    backgroundColor: '#FCFCFC',
    paddingVertical: 10,
  },
  container_header: {
    flexDirection: 'column',
    gap: 12,
  },
  title: {
    fontFamily: themeStyle.fontFamily.bold,
    fontSize: themeStyle.fontSize.header2,
    color: themeStyle.colors.primary,
  },
  chartContainer: {
    position: 'relative',
    width: '100%',
    // paddingHorizontal: 1,
  },
  centerLine: {
    position: 'absolute',
    top: -10,
    bottom: 25,
    width: 2,
    backgroundColor: '#FF4444',
    zIndex: 10,
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  dateDisplay: {
    position: 'absolute',
    top: -30,
    width: 150,
    backgroundColor: '#FF4444',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: 'center',
    zIndex: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  currentDate: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  centerLineContainer: {
    position: 'absolute',
    top: -10,
    bottom: 0,
    left: '50%',
    width: 2,
    marginLeft: 10,
    zIndex: 10,
    pointerEvents: 'none',
  },
  dateDisplayContainer: {
    position: 'absolute',
    top: 0,
    bottom: -50,
    left: '50%',
    width: 150,
    marginLeft: -65,
    zIndex: 15,
    pointerEvents: 'none',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '30%'
  },
  datePickerIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  datePickerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    flex: 1,
  },
});