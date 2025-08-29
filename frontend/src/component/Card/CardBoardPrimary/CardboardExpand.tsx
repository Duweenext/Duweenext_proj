import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { theme } from '@/theme'; // Adjust path as needed
import SensorBoardExpand from '@/src/component/Card/CardSensorPrimary/SensorBoardExpand';
import HalfCircleGauge from '../../Chart/GaugeChart';
import ButtonModalL from '../../Buttons/ButtonModalL';
import SensorCard from '../CardSensorPrimary/SensorCard';
import TextFieldSensorValue from '../../TextFields/TextFieldSensorValue';
import { useBoard } from '@/src/api/hooks/useBoard';
import { Ionicons } from '@expo/vector-icons';
import { useSensor } from '@/src/api/hooks/useSensor';

interface MeasurementData {
  ph: number;
  ec: number;
  temperature: number;
}

interface MeasurementDashboardProps {
  boardFrequency: number;
  board_id: string;
}

const { width } = Dimensions.get('window');

// tiny util for responsive clamping
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const CardBoardExpanded: React.FC<MeasurementDashboardProps> = ({ boardFrequency , board_id}) => {
  const [measurementData, setMeasurementData] = useState<MeasurementData>({
    ph: 5.6,
    ec: 152,
    temperature: 32,
  });

  const { getSensorBasicInformation , sensorData, loading} = useSensor();
  const { setBoardFrequency } = useBoard();

  useEffect(() => {
    const fetchData = async () => {
      await getSensorBasicInformation(board_id);
    };
    fetchData();
  }, [getSensorBasicInformation])

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleMeasureAgain = async (): Promise<void> => {
    setIsLoading(true);

    setTimeout(() => {
      setMeasurementData({
        ph: parseFloat((Math.random() * (7.5 - 4.5) + 4.5).toFixed(1)),
        ec: Math.floor(Math.random() * (200 - 100) + 100),
        temperature: Math.floor(Math.random() * (35 - 25) + 25),
      });
      setIsLoading(false);
    }, 2000);
  };

  const gaugeGap = clamp(Math.round(width * 0.02), 6, 16); 

  const handleBoardFrequencyChange = (boardFrequencyInput: string) => {
    const frequency = parseFloat(boardFrequencyInput);
    if (!isNaN(frequency)) {
      boardFrequency = frequency;
    }
  };

  const updateBoardFrequency = async (boardFrequency: number) => {
    await setBoardFrequency(boardFrequency, board_id);
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Measurement</Text>

        <View style={styles.measurementCard}>
          <View style={[styles.measurementRow, { gap: gaugeGap }]}>
            <HalfCircleGauge title="pH" value={measurementData.ph} unit="" min={4} max={9} extraHorizontalPadding={theme.spacing.md * 2} />
            <HalfCircleGauge title="Temperature" value={measurementData.temperature} unit="°C" min={0} max={50} extraHorizontalPadding={theme.spacing.md * 2} />
            <HalfCircleGauge title="EC" value={measurementData.ec} unit="ms/cm" min={0} max={500} extraHorizontalPadding={theme.spacing.md * 2} />
          </View>

          <ButtonModalL
            text={isLoading ? "Measuring..." : "Measure Again"}
            onPress={handleMeasureAgain}
            filledColor={theme.colors.primary}
            textColor={theme.colors.white}
            marginBottom={3}

          />
        </View>

        <View style={styles.section}>
          <View style={styles.sensorHeaderContainer}>
            <Text style={styles.sectionTitle}>Sensors</Text>
            <View style={styles.frequencyContainer}>
              <Text style={styles.sectionSubtitle}>Board Frequency:</Text>
              <View style={styles.frequencyInputContainer}>
                <TextFieldSensorValue
                  defaultValue={boardFrequency.toString()}
                  onChange={handleBoardFrequencyChange}
                />
                <TouchableOpacity
                  style={[
                    styles.submitFrequencyButton,
                    loading && styles.submitFrequencyButtonDisabled
                  ]}
                  onPress={() => updateBoardFrequency(boardFrequency)}
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

          {sensorData?.map((sensor) => (
            <View key={sensor.id} style={styles.sensorContainer}>
              <SensorCard sensor={sensor} board_uuid={board_id}/>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  section: {
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.header1,
    fontFamily: theme.fontFamily.semibold,
    color: 'black',
    // marginBottom: theme.spacing.lg,
  },
  measurementCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // gap is injected responsively in component
  },
  measurementItem: {
    alignItems: 'center',
  },
  measurementLabel: {
    fontSize: theme.fontSize.description,
    fontFamily: theme.fontFamily.medium,
    textAlign: 'center',
  },

  circularProgress: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 32,
    borderWidth: 10,
    borderColor: 'transparent',
    borderTopColor: theme.colors.success,
  },
  progressBackground: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 32,
    borderWidth: 10,
    borderColor: 'transparent',
    borderTopColor: '#E8F5F3',
    borderRightColor: '#E8F5F3',
    borderBottomColor: '#E8F5F3',
    borderLeftColor: '#E8F5F3',
  },
  measurementValue: {
    fontSize: theme.fontSize.header2,
    fontWeight: 'bold',
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
  },
  measurementValueContainer: {
    alignItems: 'center',
  },
  measurementUnit: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: '#666',
  },
  measureButton: {
    backgroundColor: theme.colors.primary,
    // paddingVertical: theme.spacing.md, // now responsive
    paddingHorizontal: theme.spacing.xl,
    // borderRadius: 30,                   // now responsive
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    // width: '50%'                        // now responsive
  },
  measureButtonText: {
    color: theme.colors.white,
    // fontSize: theme.fontSize.description, // now responsive
    fontFamily: theme.fontFamily.semibold,
  },
  measureButtonDisabled: {
    opacity: 0.6,
  },

  disconnectButton: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 25,
    marginRight: theme.spacing.md,
  },
  connectButton: {
    backgroundColor: theme.colors.success,
  },
  disconnectButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.data_text,
    fontFamily: theme.fontFamily.semibold,
  },
  connectButtonText: {
    color: theme.colors.white,
  },
  sensorContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  sensorHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.description,
    fontFamily: theme.fontFamily.medium,
    color: '#333',
  },
  frequencyContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8
  },
  frequencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  submitFrequencyButton: {
    backgroundColor: theme.colors.success, // Green background
    borderRadius: 6,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
    minHeight: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  submitFrequencyButtonDisabled: {
    backgroundColor: theme.colors.success,
    opacity: 0.6,
  },
});

export default CardBoardExpanded;
