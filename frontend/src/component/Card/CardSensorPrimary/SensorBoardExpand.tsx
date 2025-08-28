import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { theme } from '@/theme';
import TextFieldSensorValue from '@/src/component/TextFields/TextFieldSensorValue';
import SensorChart from './SensorChart';
import { SensorDataBackend, useBoard } from '@/src/api/hooks/useBoard';
import { Ionicons } from '@expo/vector-icons';

interface SensorThreshold {
  max: number;
  min: number;
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

const SensorBoardExpand: React.FC<SensorBoardExpandProps> = ({ boardId, sensor }) => {
  const { setBoardThreshold , loading} = useBoard();
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

  const [isExpanded, setIsExpanded] = useState(true);

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

  return (
    <ScrollView style={styles.container}>
      {isExpanded && (
        <>
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

          {/* Chart Section */}
          {/* <View style={styles.section}> */}
            {/* Display Temperature Chart */}
          <SensorChart 
            data={selectedSensor.historicalData} 
            title={`Summary Graph of ${selectedSensor.name}`}
          />
          {/* </View> */}
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
});

export default SensorBoardExpand;
