import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { SensorDataBackend, sensorLogScale } from '@/src/interfaces/sensor';
import { useSensor } from '@/src/api/hooks/useSensor';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { themeStyle } from '@/src/theme';
import RowButtonGroup from '../Buttons/ButtonFilter';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { getSensorSuffix } from '../Card/CardSensorPrimary/SensorBoardExpand';
import {
  addStep, formatCurrentDate, formatLabel, truncateToBucket,
  AGGRESSIVE_TRIM_THRESHOLD,
  EDGE_LEFT, EDGE_RIGHT, MAX_TOTAL_SLOTS, ScrollMetrics, 
  sensorOption, SLOT_COUNT, SPACING_PER_SCALE, TRIM_AMOUNT
} from '@/src/utils/chartUtils';

type SensorChartProp = { boardId: string; sensor: SensorDataBackend };

export default function SensorChart({ boardId, sensor }: SensorChartProp) {
  const [scale, setScale] = useState<sensorLogScale>('day');
  const [axisSlots, setAxisSlots] = useState<Date[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const spacing = useMemo(() => SPACING_PER_SCALE[scale], [scale]);

  const { getSensorGraphLog, mergedGraph } = useSensor(boardId);

  const scrollRef = useRef<any>(null);
  const metricsRef = useRef<ScrollMetrics>({ x: 0, w: 1, cw: 1 });
  const cooldown = useRef(0);
  const isExtending = useRef(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isJumpingToDate, setIsJumpingToDate] = useState(false);

  const fetchGraphLog = async (end: Date, count: number) => {
    await getSensorGraphLog(end.toISOString(), scale, count)
      .then(() => {
        setIsInitialized(true);
        console.log('✅ Initial load complete');
      })
      .catch(err => console.error('❌ Initial load failed:', err));
  }

  useEffect(() => {
    const end = truncateToBucket(new Date(), scale);
    const count = SLOT_COUNT[scale];
    const start = addStep(end, scale, -(count - 1));
    const init = Array.from({ length: count }, (_, i) => addStep(start, scale, i));

    setAxisSlots(init);
    setIsInitialized(false);

    fetchGraphLog(end, count);

  }, [boardId, getSensorGraphLog]);

  useEffect(() => {
    if (!isInitialized || axisSlots.length === 0) return;

    const currentCenter = axisSlots[Math.floor(axisSlots.length / 2)];
    const truncatedCenter = truncateToBucket(currentCenter, scale);

    const count = SLOT_COUNT[scale];
    const newStart = addStep(currentCenter, scale, -Math.floor(count / 2));
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
    metricsRef.current = {
      x: contentOffset?.x ?? 0,
      w: layoutMeasurement?.width ?? 1,
      cw: contentSize?.width ?? 1,
    };
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
          return trimmed;
        } else if (newAxisSlots.length > MAX_TOTAL_SLOTS) {
          const trimmed = newAxisSlots.slice(0, -TRIM_AMOUNT);
          return trimmed;
        }

        return newAxisSlots;
      });

      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ x: (metricsRef.current.x + dx), animated: false });
      });

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

          const adjustedX = metricsRef.current.x - (trimAmount * spacing);
          requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ x: Math.max(0, adjustedX), animated: false });
          });

          return trimmed;
        } else if (newAxisSlots.length > MAX_TOTAL_SLOTS) {
          const trimmed = newAxisSlots.slice(TRIM_AMOUNT);

          const adjustedX = metricsRef.current.x - (TRIM_AMOUNT * spacing);
          requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ x: Math.max(0, adjustedX), animated: false });
          });

          return trimmed;
        }

        return newAxisSlots;
      });

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
      cooldown.current = now + 500;
    } else if (rightRatio > EDGE_RIGHT) {
      extendRight();
      cooldown.current = now + 500;
    }
  }, [extendLeft, extendRight]);

  const handleScaleChange = useCallback((value: sensorLogScale) => {
    console.log('Scale changed to:', value);
    setScale(value);
  }, []);

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
      const t = new Date(row.created_at);
      const b = truncateToBucket(t, scale).getTime();
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

  const scaleButtons = useMemo(() => {
    return sensorOption.map(option => ({
      id: option,
      label: option.toUpperCase(),
      value: option,
      color: '#f5f5f5',
      focusColor: '#1A736A',
      textColor: '#666',
      focusTextColor: '#ffffff',
      onPress: handleScaleChange
    }));
  }, [handleScaleChange]);

  const currentDate = getCurrentDateFromScroll();

  const jumpToDate = useCallback(async (targetDate: Date) => {
    if (isJumpingToDate) return;

    setIsJumpingToDate(true);

    try {
      const truncatedTarget = truncateToBucket(targetDate, scale);
      const count = SLOT_COUNT[scale];
      const newStart = addStep(truncatedTarget, scale, -Math.floor(count / 2));
      const newSlots = Array.from({ length: count }, (_, i) => addStep(newStart, scale, i));

      setAxisSlots(newSlots);
      await getSensorGraphLog(truncatedTarget.toISOString(), scale, count);

      requestAnimationFrame(() => {
        const targetIndex = Math.floor(count / 2);
        const targetX = targetIndex * spacing - (metricsRef.current.w / 2.1);
        scrollRef.current?.scrollTo({ x: targetX, animated: true });
      });

    } catch (error) {
    } finally {
      setIsJumpingToDate(false);
    }
  }, [boardId, scale, spacing, getSensorGraphLog, isJumpingToDate]);

  const handleDatePickerChange = useCallback((event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'set' && date) {
      setSelectedDate(date);
      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
      jumpToDate(date);
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  }, [jumpToDate]);

  return (
    <View style={style.container}>
      <View style={style.container_header}>
        <Text style={style.title}>Summary Graph of {sensor.sensor_type}</Text>
        <TouchableOpacity
          style={style.datePickerButton}
          onPress={() => setShowDatePicker(true)}
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
            onScrollEndDrag={onScrollEnd}
            onMomentumScrollEnd={onScrollEnd}
            showVerticalLines
            scrollRef={scrollRef as any}
            showValuesAsDataPointsText={points.length <= 24}
            curved
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
            lineGradient
            animateOnDataChange
            scrollAnimation
            animationDuration={10}
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
          mode={scale === 'minute' || scale === 'hour' ? 'datetime' : 'date'}
          display="default"
          onChange={handleDatePickerChange}
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