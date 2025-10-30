import React, { useEffect, useState, useCallback, useMemo } from 'react';
// --- MODIFIED --- Added ScrollView
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, Modal, FlatList, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { theme } from '@/src/theme';
import RowButtonGroup from '../../Buttons/ButtonFilter';
import { SensorDataBackend, sensorLogScale } from '@/src/interfaces/sensor';
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
import { chart_themes, ThemeKey } from './chartTheme';
import D3LineChart from './D3Linechart'; 
interface SensorBoardExpandProps {
  boardId: string;
  sensor: SensorDataBackend;
}
export const getSensorSuffix = (type: string): string => {
  switch (type) {
    case 'Temperature': return '°C';
    case 'pH': return '';
    case 'EC': return ' μS';
    default: return '';
  }
};

const SensorBoardExpand: React.FC<SensorBoardExpandProps> = ({ boardId, sensor }) => {
  const { t } = useTranslation();
  const [scale, setScale] = useState<sensorLogScale>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isThemeModalVisible, setThemeModalVisible] = useState(false);
  const [activeThemeKey, setActiveThemeKey] = useState<ThemeKey>('default');
  const activeTheme = useMemo(() => chart_themes[activeThemeKey].styles, [activeThemeKey]);
  const handleThemeSelect = (themeKey: ThemeKey) => {
    setActiveThemeKey(themeKey);
    setThemeModalVisible(false);
  };
  const apiEndDate = useMemo(() => {
    const { end } = buildWindowDomain(selectedDate, scale);
    return end;
  }, [selectedDate, scale]);
  const { graphData, timeRange, getSensorGraphLog } = useSensorGraph(
    boardId,
    scale,
    apiEndDate.toISOString()
  );
  const chartDomain = useMemo(() => {
    if (scale === 'all' && timeRange.start && timeRange.end) {
      return {
        start: new Date(timeRange.start),
        end: new Date(timeRange.end),
      };
    }
    return buildWindowDomain(selectedDate, scale);
  }, [selectedDate, scale, timeRange]);
  useEffect(() => {
    const fetchDataForWindow = async () => {
      setIsLoading(true);
      try {
        await getSensorGraphLog();
      } catch (error) {
        console.error(`Failed to fetch graph data for scale "${scale}":`, error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDataForWindow();
  }, [getSensorGraphLog]);
  const axisSlots = useMemo(() => {
    const { start, end } = chartDomain;
    if (scale === 'all') {
      if (!timeRange.start || !timeRange.end) {
        return []; 
      }
      return makeSlotsFromRange(
        new Date(timeRange.start),
        new Date(timeRange.end),
        SLOT_COUNT[scale]
      );
    }
    return makeSlots(start, scale, SLOT_COUNT[scale]);
  }, [chartDomain, scale, timeRange.start, timeRange.end]); 

  const points = useMemo(() => {
    if (!isLoading && graphData && graphData.length === 0) {
      return [];
    }

    const binnedValues = binToSlots(sensor.sensor_type, graphData, axisSlots);
    return axisSlots.map((slot, i) => {
      const val = binnedValues[i];
      const roundedVal = Math.round(val * 100) / 100;
      return {
        value: roundedVal,
        label: formatLabel(slot, scale),
        dataPointText: roundedVal > 0 ? `${roundedVal}` : '',
      };
    });
  }, [axisSlots, graphData, scale, sensor.sensor_type, isLoading]);

  const { maxValue } = useMemo(() => {
    const ys = points.map(p => p.value); 
    const max = Math.max(...ys, 0);
    const calculatedMax = Number.isFinite(max) ? Math.ceil(max * 1.2) || 10 : 10;
    return { maxValue: calculatedMax }; 
  }, [points]); 
  const shiftWindow = (dir: 1 | -1) => {
    const newDate = addStep(selectedDate, scale, dir);
    setSelectedDate(newDate);
  };
  const handleDateChange = (event: any, date?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (date && event.type === 'set') {
      const newSelectedDate = new Date(selectedDate.getTime());
      newSelectedDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setSelectedDate(newSelectedDate);
    }
  };
  const handleTimeChange = (event: any, date?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (date && event.type === 'set') {
      const newSelectedDate = new Date(selectedDate.getTime());
      newSelectedDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
      setSelectedDate(newSelectedDate);
    }
  };
  const displayDateText = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    if (scale === 'hour') {
      const startHour = new Date(selectedDate);
      startHour.setMinutes(0, 0, 0);
      const endHour = new Date(startHour);
      endHour.setHours(startHour.getHours() + 1);
      endHour.setMinutes(59);
      return `${startHour.toLocaleString('en-US', options)}, ${startHour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${endHour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (scale === 'all') {
      return selectedDate.toLocaleString('en-US', { ...options, hour: '2-digit', minute: '2-digit' });
    }
    return selectedDate.toLocaleDateString('en-US', options);
  }, [selectedDate, scale]);
  const handleScaleChange = useCallback((newScale: sensorLogScale) => {
    setScale(newScale);
    setSelectedDate(new Date());
  }, []);
  const scaleButtons = useMemo(() => {
    return sensorOption.map(option => ({
      id: option,
      label: t(option),
      value: t(option),
      onPress: () => handleScaleChange(option as sensorLogScale),
    }));
  }, [t, handleScaleChange]);


  return (
    <View style={style.container}>
      {/* --- Header is unchanged --- */}
      <View style={style.header}>
        <View style={style.titleRow}>
          <Text style={style.title}>
            {t('Summary Graph of')} {t(sensor.sensor_type)}
          </Text>
          <TouchableOpacity onPress={() => setThemeModalVisible(true)}>
            <MaterialIcons name="palette" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={style.controlRow}>
          <TouchableOpacity style={style.navBtn} onPress={() => shiftWindow(-1)} disabled={isLoading}>
            <MaterialIcons name="chevron-left" size={24} color={isLoading ? '#ccc' : '#000'} />
          </TouchableOpacity>
          {(scale === 'hour' || scale === 'all') ? (
            <>
              <TouchableOpacity
                style={[style.datePickerButton, { flex: 0.7 }]}
                onPress={() => setShowPicker(true)}
                disabled={isLoading}
              >
                <MaterialIcons name="date-range" size={16} color="black" />
                <Text style={style.datePickerText}>
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[style.datePickerButton, { flex: 0.3 }]}
                onPress={() => setShowTimePicker(true)}
                disabled={isLoading}
              >
                <MaterialIcons name="access-time" size={16} color="black" />
                <Text style={style.datePickerText}>
                  {selectedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={style.datePickerButton} onPress={() => setShowPicker(true)} disabled={isLoading}>
              <MaterialIcons name="date-range" size={16} color="black" />
              <Text style={style.datePickerText}>{displayDateText}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={style.navBtn} onPress={() => shiftWindow(1)} disabled={isLoading}>
            <MaterialIcons name="chevron-right" size={24} color={isLoading ? '#ccc' : '#000'} />
          </TouchableOpacity>
        </View>
        <RowButtonGroup buttons={scaleButtons} defaultSelected={scale} scrollable />
      </View>

      <View style={[style.chartContainer, { opacity: isLoading ? 0.5 : 1 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <D3LineChart
            data={points}
            height={220}
            maxValue={maxValue}
            yAxisSuffix={getSensorSuffix(sensor.sensor_type)}
            theme={activeTheme}
            spacing={100}
            initialSpacing={30} 
          />
        </ScrollView>
      </View>

      {showPicker && (
        <DateTimePicker value={selectedDate} mode="date" display="default" onChange={handleDateChange} />
      )}
      {showTimePicker && (
        <DateTimePicker value={selectedDate} mode="time" display="default" onChange={handleTimeChange} />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isThemeModalVisible}
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <View style={style.modalContainer}>
          <View style={style.modalContent}>
            <Text style={style.modalTitle}>Select a Theme</Text>
            <FlatList
              data={Object.entries(chart_themes)}
              numColumns={2}
              style={{ alignSelf: 'stretch', maxHeight: 340 }} 
               contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 8 }}
               columnWrapperStyle={{ justifyContent: 'space-between' }}
              keyExtractor={(item) => item[0]}
              renderItem={({ item }) => {
                const [key, themeData] = item;
                return (
                  <TouchableOpacity style={style.themeItem} onPress={() => handleThemeSelect(key as ThemeKey)}>
                    <View style={[style.themeSwatch, { backgroundColor: themeData.styles.backgroundColor, borderColor: themeData.styles.textColor }]} />
                    <Text style={style.themeName}>{themeData.name}</Text>
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={style.closeButton} onPress={() => setThemeModalVisible(false)}>
              <Text style={style.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const style = StyleSheet.create({
  container: { backgroundColor: '#FCFCFC', padding: 16, gap: 20 },
  header: { gap: 12 },
  title: {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize.header2,
    color: theme.colors.primary,
  },
  chartContainer: { 
    width: '100%',
  }, 
  controlRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navBtn: { backgroundColor: '#f0f0f0', borderRadius: 8, padding: 4 },
  datePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  datePickerText: { fontSize: 12, fontWeight: '600', color: '#495057' },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    maxHeight: '70%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  themeItem: {
    flex: 1,
    alignItems: 'center',
    margin: 10,
    width: '48%', 
  },
  themeSwatch: {
    width: 80,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 14,
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default React.memo(SensorBoardExpand);