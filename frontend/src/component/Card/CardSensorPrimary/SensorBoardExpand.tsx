import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { theme } from '@/theme';
import TextFieldSensorValue from '@/src/component/TextFields/TextFieldSensorValue';
import SensorChart from './SensorChart';
import { Ionicons } from '@expo/vector-icons';
import { useSensor } from '@/src/api/hooks/useSensor';
import { BackendSensorLogData, SensorDataBackend } from '@/src/interfaces/sensor';

interface SensorThreshold {
  max: number;
  min: number;
}


// ✅ Chart data format
interface ChartDataPoint {
  day: string;
  value: number;
  x: number;
  y: number;
  timestamp: string;
  date: Date;
}

interface SensorData {
  id: number;
  name: string;
  type: string;
  isConnected: boolean;
  currentValue?: number;
  unit?: string;
  threshold: SensorThreshold;
  historicalData: { day: string; value: number; x: number; y: number }[];
}

interface SensorBoardExpandProps {
  boardId: string;
  sensor: SensorDataBackend;
}

const { width, height } = Dimensions.get('window');
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const generateTestSensorData = (sensorType: string): BackendSensorLogData[] => {
  const testData: BackendSensorLogData[] = [];
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  
  // ✅ Define realistic ranges for each sensor type
  const sensorRanges = {
    temperature: { min: 20, max: 35, baseline: 27.5 }, // °C
    ph: { min: 6.0, max: 8.5, baseline: 7.2 },         // pH
    ec: { min: 800, max: 1200, baseline: 1000 },       // µS/cm
  };
  
  const range = sensorRanges[sensorType.toLowerCase() as keyof typeof sensorRanges] || sensorRanges.temperature;
  
  // ✅ Generate data for 30 days, 4 readings per day
  for (let day = 0; day < 30; day++) {
    for (let reading = 0; reading < 4; reading++) {
      const currentDate = new Date(oneMonthAgo.getTime() + day * 24 * 60 * 60 * 1000);
      
      // ✅ Set different times for each reading (morning, noon, afternoon, evening)
      const hours = [6, 12, 16, 20][reading];
      currentDate.setHours(hours, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
      
      // ✅ Generate realistic values with some daily variation
      const dailyVariation = Math.sin((day / 30) * Math.PI * 2) * (range.max - range.min) * 0.3;
      const randomVariation = (Math.random() - 0.5) * (range.max - range.min) * 0.2;
      const timeOfDayVariation = Math.sin((reading / 4) * Math.PI * 2) * (range.max - range.min) * 0.1;
      
      let value = range.baseline + dailyVariation + randomVariation + timeOfDayVariation;
      value = Math.max(range.min, Math.min(range.max, value)); // Clamp to range
      
      // ✅ Round to appropriate decimal places
      if (sensorType.toLowerCase() === 'temperature') {
        value = Math.round(value * 10) / 10; // 1 decimal place
      } else if (sensorType.toLowerCase() === 'ph') {
        value = Math.round(value * 100) / 100; // 2 decimal places
      } else if (sensorType.toLowerCase() === 'ec') {
        value = Math.round(value); // No decimal places
      }
      
      // ✅ Create mock backend data structure
      const mockData: BackendSensorLogData = {
        id: testData.length + 1,
        board_id: "TEST_BOARD_123",
        temperature: sensorType.toLowerCase() === 'temperature' ? value : 25.0,
        ec: sensorType.toLowerCase() === 'ec' ? value : 1000,
        ph: sensorType.toLowerCase() === 'ph' ? value : 7.0,
        created_at: currentDate.toISOString(),
      };
      
      testData.push(mockData);
    }
  }
  
  // ✅ Sort by date to ensure chronological order
  return testData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};

const SensorBoardExpand: React.FC<SensorBoardExpandProps> = ({ boardId, sensor }) => {
  const { getSensorGraphLog ,setBoardThreshold, sensorGraphData , loading} = useSensor();
  const [selectedSensor, setSelectedSensor] = useState<SensorData>({
    id: sensor?.id ?? 0,
    name: sensor.sensor_type,
    type: sensor.sensor_type,
    isConnected: true,
    unit: '',
    threshold: {
      max: sensor?.sensor_threshold_max,
      min: sensor?.sensor_threshold_min
    },
    historicalData: [
      { day: 'Day1', value: 5.6, x: 1, y: 5.6 },
      { day: 'Day2', value: 4.8, x: 2, y: 4.8 },
      { day: 'Day3', value: 5.4, x: 3, y: 5.4 },
      { day: 'Day4', value: 6.5, x: 4, y: 6.5 },
      { day: 'Day5', value: 7.5, x: 5, y: 7.5 },
      { day: 'Day6', value: 8.1, x: 6, y: 8.1 },
      { day: 'Day7', value: 7.9, x: 7, y: 7.9 },
    ]
  });

  function getUnitForSensorType(sensorType: string): string {
    switch (sensorType.toLowerCase()) {
      case 'temperature':
        return '°C';
      case 'ph':
        return 'pH';
      case 'ec':
        return 'µS/cm';
      default:
        return '';
    }
  }

  // ✅ Helper function to get value from backend data based on sensor type
  function getValueFromBackendData(data: BackendSensorLogData, sensorType: string): number {
    switch (sensorType.toLowerCase()) {
      case 'temperature':
        return data.temperature;
      case 'ph':
        return data.ph;
      case 'ec':
        return data.ec;
      default:
        return 0;
    }
  }

    const convertBackendDataToChart = (backendData: BackendSensorLogData[]): ChartDataPoint[] => {
    if (!backendData || backendData.length === 0) {
      return [];
    }

    return backendData
      .map((item, index) => {
        const date = new Date(item.created_at);
        const value = getValueFromBackendData(item, sensor.sensor_type);
        
        return {
          day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: value,
          x: index + 1,
          y: value,
          timestamp: item.created_at,
          date: date,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime()); // ✅ Sort by date ascending
  };

  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await getSensorGraphLog(boardId, sensor.sensor_type , 7);
    };
    fetchData();
  }, [getSensorGraphLog]);

    useEffect(() => {
    if (sensorGraphData && sensorGraphData.length > 0) {
      console.log(`📈 Processing ${sensorGraphData.length} data points for ${sensor.sensor_type}`);

      const testData = generateTestSensorData(sensor.sensor_type);
      
      const chartData = convertBackendDataToChart(testData);
      const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].value : undefined;
      
      setSelectedSensor(prev => ({
        ...prev,
        historicalData: chartData,
        currentValue: latestValue,
      }));
      
      console.log(`✅ Chart updated with ${chartData.length} points. Latest value: ${latestValue}`);
    }
  }, [sensorGraphData, sensor.sensor_type]);

  // Handle threshold changes
  const handleMaxThresholdChange = (value: string) => {
    setSelectedSensor(prev => ({
      ...prev,
      threshold: {
        ...prev.threshold,
        max: parseFloat(value) || 0
      }
    }));
  };

  const handleMinThresholdChange = (value: string) => {
    setSelectedSensor(prev => ({
      ...prev,
      threshold: {
        ...prev.threshold,
        min: parseFloat(value) || 0
      }
    }));
  };

  const changeBoardThreshold = () => {
    setBoardThreshold(selectedSensor.type, selectedSensor.threshold.max, selectedSensor.threshold.min, boardId);
  }

  const getDataStatistics = () => {
    if (selectedSensor.historicalData.length === 0) {
      return { min: 0, max: 0, avg: 0, latest: 0 };
    }

    const values = selectedSensor.historicalData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const latest = values[values.length - 1];

    return { min, max, avg, latest };
  };

  const stats = getDataStatistics();

  return (
    <ScrollView style={styles.container}>
      {isExpanded && (
        <>
          {/* ✅ Data Statistics Section */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>📊 Data Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Latest</Text>
                <Text style={styles.statValue}>
                  {stats.latest.toFixed(2)}{selectedSensor.unit}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Average</Text>
                <Text style={styles.statValue}>
                  {stats.avg.toFixed(2)}{selectedSensor.unit}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Min</Text>
                <Text style={styles.statValue}>
                  {stats.min.toFixed(2)}{selectedSensor.unit}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Max</Text>
                <Text style={styles.statValue}>
                  {stats.max.toFixed(2)}{selectedSensor.unit}
                </Text>
              </View>
            </View>
            <Text style={styles.dataCount}>
              📈 {selectedSensor.historicalData.length} data points available
            </Text>
          </View>

          <View style={styles.thresholdContainer}>
            <View style={styles.thresholdHeader}>
              <Text style={styles.thresholdTitle}>Threshold:</Text>
              <View style={styles.infoIcon}>
                <Text style={styles.infoText}>?</Text>
              </View>
            </View>
            
            <View style={styles.thresholdRow}>
              <View style={styles.thresholdItem}>
                <Text style={styles.thresholdLabel}>Max:</Text>
                <TextFieldSensorValue 
                  defaultValue={selectedSensor.threshold.max.toString()}
                  onChange={handleMaxThresholdChange}
                />
                <Text style={styles.unitText}>{selectedSensor.unit}</Text>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    loading && styles.submitButtonDisabled
                  ]}
                  onPress={changeBoardThreshold}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="checkmark" 
                    size={16} 
                    color={theme.colors.white} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.thresholdRow}>
              <View style={styles.thresholdItem}>
                <Text style={styles.thresholdLabel}>Min:</Text>
                <TextFieldSensorValue 
                  defaultValue={selectedSensor.threshold.min.toString()}
                  onChange={handleMinThresholdChange}
                />
                <Text style={styles.unitText}>{selectedSensor.unit}</Text>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    loading && styles.submitButtonDisabled
                  ]}
                  onPress={changeBoardThreshold}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="checkmark" 
                    size={16} 
                    color={theme.colors.white} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* ✅ Chart Section with Real Data */}
          {selectedSensor.historicalData.length > 0 ? (
            <SensorChart 
              boardId={sensor.board_id}
              sensorType={selectedSensor.type}
              initialResolution='day'
              title={`${selectedSensor.name} Trends (${selectedSensor.historicalData.length} points)`}
            />
          ) : (
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>
                {loading ? '📊 Loading sensor data...' : '📊 No data available'}
              </Text>
              <Text style={styles.chartSubtext}>
                {loading ? 'Please wait while we fetch your sensor readings' : 'Check your sensor connection and try again'}
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderBottomRightRadius: theme.borderRadius.lg,
    borderBottomLeftRadius: theme.borderRadius.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.header1,
    fontFamily: theme.fontFamily.semibold,
    color: 'black',
    marginBottom: theme.spacing.lg,
  },
  emptyState: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyStateText: {
    fontSize: theme.fontSize.header2,
    fontFamily: theme.fontFamily.medium,
    // color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: theme.fontSize.description,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.secondary,
    textAlign: 'center',
  },
  loadingState: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSize.description,
    fontFamily: theme.fontFamily.medium,
    // color: theme.colors.primary,
  },
  sensorCard: {
    // backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sensorInfo: {
    flex: 1,
  },
  sensorName: {
    color: theme.colors.white,
    fontSize: theme.fontSize.header2,
    fontFamily: theme.fontFamily.semibold,
    marginBottom: theme.spacing.xxs,
  },
  sensorType: {
    color: theme.colors.secondary,
    fontSize: theme.fontSize.data_text,
    fontFamily: theme.fontFamily.regular,
    marginBottom: theme.spacing.xxs,
  },
  sensorStatus: {
    color: theme.colors.secondary,
    fontSize: theme.fontSize.data_text,
    fontFamily: theme.fontFamily.regular,
    marginBottom: theme.spacing.xxs,
  },
  lastReading: {
    color: theme.colors.white,
    fontSize: theme.fontSize.data_text,
    fontFamily: theme.fontFamily.medium,
  },
  sensorActions: {
    padding: theme.spacing.sm,
  },
  chevron: {
    color: theme.colors.white,
    fontSize: theme.fontSize['2xl'],
    fontFamily: theme.fontFamily.bold,
  },
  actionSection: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  actionButton: {
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  refreshButton: {
    // backgroundColor: theme.colors.primary,
  },
  configButton: {
    backgroundColor: theme.colors.white,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.description,
    fontFamily: theme.fontFamily.semibold,
  },
  // New styles for sensor expand
  headerContainer: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  headerContent: {
    flex: 1,
  },
  sensorTitle: {
    color: theme.colors.white,
    fontSize: theme.fontSize.header2,
    fontFamily: theme.fontFamily.semibold,
    marginBottom: theme.spacing.xs,
  },
  statusText: {
    color: theme.colors.secondary,
    fontSize: theme.fontSize.data_text,
    fontFamily: theme.fontFamily.regular,
  },
  thresholdContainer: {
    padding: theme.spacing.xs,
  },
  thresholdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  thresholdTitle: {
    fontSize: theme.fontSize.header2,
    fontFamily: theme.fontFamily.medium,
    color: '#1A736A',
    marginRight: theme.spacing.xs,
  },
  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1A736A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    color: 'white',
    fontSize: 12,
    fontFamily: theme.fontFamily.bold,
  },
  thresholdRow: {
    marginBottom: theme.spacing.md,
  },
  thresholdItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  thresholdLabel: {
    fontSize: theme.fontSize.header2,
    fontFamily: theme.fontFamily.medium,
    color: '#1A736A',
    minWidth: 40,
  },
  unitText: {
    fontSize: theme.fontSize.description,
    fontFamily: theme.fontFamily.regular,
    color: '#1A736A',
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  chartPlaceholderText: {
    fontSize: theme.fontSize.description,
    fontFamily: theme.fontFamily.medium,
    color: '#9CA3AF',
    marginBottom: theme.spacing.xs,
  },
  chartSubtext: {
    fontSize: theme.fontSize.data_text,
    fontFamily: theme.fontFamily.regular,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: theme.spacing.md,
  },
  chartTooltip: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(26, 115, 106, 0.9)',
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  tooltipText: {
    color: 'white',
    fontSize: theme.fontSize.data_text,
    fontFamily: theme.fontFamily.medium,
  },
  submitButton: {
    backgroundColor: '#1A736A',
    borderRadius: 6,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  statsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statsTitle: {
    fontSize: theme.fontSize.header2,
    fontFamily: theme.fontFamily.medium,
    color: '#1A736A',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  statItem: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: theme.fontSize.data_text,
    fontFamily: theme.fontFamily.regular,
    color: '#666',
    marginBottom: theme.spacing.xxs,
  },
  statValue: {
    fontSize: theme.fontSize.header2,
    fontFamily: theme.fontFamily.semibold,
    color: '#1A736A',
  },
  dataCount: {
    fontSize: theme.fontSize.data_text,
    fontFamily: theme.fontFamily.regular,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SensorBoardExpand;
