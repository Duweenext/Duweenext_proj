import React, { useEffect, useState, useMemo, useCallback } from 'react'; // Added useCallback
// Added ScrollView
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import RowButtonGroup from '../Buttons/ButtonFilter';
import { sensorLogScale } from '@/src/interfaces/sensor';
import { useSensorGraph } from '@/src/api/hooks/useSensorGraph';
import {
  addStep,
  buildWindowDomain,
  makeSlots,
  binToSlots,
  formatLabel,
  SLOT_COUNT,
  sensorOption,
  makeSlotsFromRange,
} from '@/src/utils/chartUtils';
import { chart_themes } from '@/src/component/Card/CardSensorPrimary/chartTheme';
// Make sure this path is correct for your project
import D3MultiLineChart, { D3ChartSeries } from '../Card/CardSensorPrimary/D3MultiLineChart'; 

type SummaryChartProp = {
  boardId: string;
};

const SummaryChart: React.FC<SummaryChartProp> = ({ boardId }) => {
  const { t } = useTranslation();
  const [scale, setScale] = useState<sensorLogScale>('day');
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const activeTheme = useMemo(() => chart_themes.default.styles, []);

  const apiEndDate = useMemo(() => {
    const { end } = buildWindowDomain(selectedDate, scale);
    return end;
  }, [selectedDate, scale]);

  const { getSensorGraphLog, graphData , timeRange} = useSensorGraph(boardId, scale, apiEndDate.toISOString());

  // This is the correct logic for handling all scales
  const chartDomain = useMemo(() => {
    if (scale === 'all' && timeRange.start && timeRange.end) {
      return {
        start: new Date(timeRange.start),
        end: new Date(timeRange.end),
      };
    }
    return buildWindowDomain(selectedDate, scale);
  }, [selectedDate, scale, timeRange.start, timeRange.end]);

  const axisSlots = useMemo(() => {
    const { start, end } = chartDomain;
    if (scale === 'all') {
      if (!timeRange.start || !timeRange.end) {
        return []; // Data not ready
      }
      return makeSlotsFromRange(
        new Date(timeRange.start),
        new Date(timeRange.end),
        SLOT_COUNT[scale]
      );
    }
    return makeSlots(start, scale, SLOT_COUNT[scale]);
  }, [chartDomain, scale, timeRange.start, timeRange.end]);

  useEffect(() => {
    const fetchDataForWindow = async () => {
      setIsLoading(true);
      try {
        await getSensorGraphLog();
      } catch (error) {
        console.error("Failed to fetch summary graph data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDataForWindow();
  }, [getSensorGraphLog]);

  const chartSeries = useMemo((): D3ChartSeries[] => {
    // This check correctly shows "No log" when data is empty
    if (isLoading || !graphData || graphData.length === 0) { 
      return [
        { data: [], lineColor: '#CDB4DB', areaColor: '#CDB4DB' },
        { data: [], lineColor: '#F2BC79', areaColor: '#F2BC79' },
        { data: [], lineColor: '#F77979', areaColor: '#F77979' },
      ];
    }
  
    const tempBinned = binToSlots('Temperature', graphData, axisSlots);
    const ecBinned = binToSlots('EC', graphData, axisSlots);
    const phBinned = binToSlots('pH', graphData, axisSlots);
  
    const mapToPoints = (binnedData: number[]) => {
      return axisSlots.map((slot, i) => {
        const roundedVal = Math.round(binnedData[i] * 100) / 100;
        return {
          value: roundedVal,
          label: formatLabel(slot, scale),
          dataPointText: roundedVal > 0 ? `${roundedVal}` : '', 
        };
      });
    };
  
    return [
      { data: mapToPoints(tempBinned), lineColor: '#CDB4DB', areaColor: '#CDB4DB' },
      { data: mapToPoints(ecBinned), lineColor: '#F2BC79', areaColor: '#F2BC79' },
      { data: mapToPoints(phBinned), lineColor: '#F77979', areaColor: '#F77979' },
    ];
  }, [axisSlots, graphData, scale, isLoading]);
  
  const { maxValue } = useMemo(() => {
    const allValues = chartSeries.flatMap(series => series.data.map(p => p.value));
    const max = Math.max(...allValues, 0);
    return {
      maxValue: Number.isFinite(max) ? Math.ceil(max * 1.2) || 10 : 10,
    };
  }, [chartSeries]);

  // --- Wrapped handlers in useCallback ---
  const shiftWindow = useCallback((dir: 1 | -1) => {
    const newDate = addStep(selectedDate, scale, dir);
    setSelectedDate(newDate);
  }, [selectedDate, scale]);

  const handleDateChange = useCallback((event: any, date?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (date && event.type === 'set') {
      const newSelectedDate = new Date(selectedDate.getTime());
      newSelectedDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setSelectedDate(newSelectedDate);
    }
  }, [selectedDate]);

  const handleTimeChange = useCallback((event: any, date?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (date && event.type === 'set') {
      const newSelectedDate = new Date(selectedDate.getTime());
      newSelectedDate.setHours(date.getHours(), date.getMinutes());
      setSelectedDate(newSelectedDate);
    }
  }, [selectedDate]);

  const handleScaleChange = useCallback((newScale: sensorLogScale) => {
    setScale(newScale);
    const newDate = new Date();
    if (newScale === 'day' || newScale === 'week' || newScale === 'month') {
      newDate.setHours(23, 59, 59, 999);
    }
    setSelectedDate(newDate);
  }, []);

  const scaleButtons = useMemo(() => {
    return sensorOption.map(option => ({
      id: option,
      label: t(option),
      value: t(option),
      onPress: () => handleScaleChange(option as sensorLogScale),
    }));
  }, [t, handleScaleChange]); // Added handleScaleChange dependency
  
  return (
    <View style={[style.container, { backgroundColor: activeTheme.backgroundColor }]}>
      <View style={style.header}>
        <View style={style.controlRow}>
          <TouchableOpacity style={style.navBtn} onPress={() => shiftWindow(-1)} disabled={isLoading}>
            <MaterialIcons name="chevron-left" size={24} color={isLoading ? '#555' : '#FFF'} />
          </TouchableOpacity>
          {(scale === 'hour' || scale === 'all') ? (
            <>
              <TouchableOpacity
                style={[style.datePickerButton, { flex: 0.7 }]}
                onPress={() => setShowPicker(true)}
                disabled={isLoading}
              >
                <MaterialIcons name="date-range" size={16} color="white" />
                <Text style={style.datePickerText}>
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[style.datePickerButton, { flex: 0.3 }]}
                onPress={() => setShowTimePicker(true)}
                disabled={isLoading}
              >
                <MaterialIcons name="access-time" size={16} color="white" />
                <Text style={style.datePickerText}>
                  {selectedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={style.datePickerButton} onPress={() => setShowPicker(true)} disabled={isLoading}>
              <MaterialIcons name="date-range" size={16} color="white" />
              <Text style={style.datePickerText}>
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={style.navBtn} onPress={() => shiftWindow(1)} disabled={isLoading}>
            <MaterialIcons name="chevron-right" size={24} color={isLoading ? '#555' : '#FFF'} />
          </TouchableOpacity>
        </View>
        <RowButtonGroup buttons={scaleButtons} defaultSelected={scale} scrollable />
      </View>

      <View style={[style.chartContainer, { opacity: isLoading ? 0.5 : 1 }]}>
        <View style={style.legendContainer}>
          <View style={style.legendItem}><View style={[style.legendColor, { backgroundColor: '#CDB4DB' }]} /><Text style={style.legendText}>{t('Temperature')} (°C)</Text></View>
          <View style={style.legendItem}><View style={[style.legendColor, { backgroundColor: '#F2BC79' }]} /><Text style={style.legendText}>{t('EC')} (μS)</Text></View>
          <View style={style.legendItem}><View style={[style.legendColor, { backgroundColor: '#F77979' }]} /><Text style={style.legendText}>{t('pH')}</Text></View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <D3MultiLineChart
            series={chartSeries}
            height={300}
            maxValue={maxValue}
            yAxisSuffix="" // Legend already has units
            theme={activeTheme}
            spacing={100}
            initialSpacing={20}
          />
        </ScrollView>
      </View>

      {showPicker && (
        <DateTimePicker value={selectedDate} mode="date" display="default" onChange={handleDateChange} />
      )}
      {showTimePicker && (
        <DateTimePicker value={selectedDate} mode="time" display="default" onChange={handleTimeChange} />
      )}
    </View>
  );
}

const style = StyleSheet.create({
  container: { paddingVertical: 10, paddingHorizontal: 16, gap: 20, borderRadius: 12 },
  header: { gap: 12 },
  controlRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navBtn: { backgroundColor: '#333', borderRadius: 8, padding: 4 },
  datePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3C3C3E',
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  datePickerText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  chartContainer: { width: '100%' },
  legendContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendColor: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: '#E5E5EA' }, 
});

export default React.memo(SummaryChart);