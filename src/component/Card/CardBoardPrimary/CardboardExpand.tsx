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
import IconButton from '../../Buttons/IconButton';
import Toast from 'react-native-toast-message';
import DropDownTemplate from '../../Dropdown/DropDownTemplate';

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

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const CardBoardExpanded: React.FC<MeasurementDashboardProps> = ({ boardFrequency, board_id }) => {

  const [frequency, setFrequency] = useState<number>(boardFrequency);
  const [isCustomEditFrequency, setIsCustomEditFrequency] = useState<boolean>(false);
  const { getSensorBasicInformation, measureCurrent, sensorData, currentSensorData, loading, currentLoading } = useSensor();
  const { setBoardFrequency } = useBoard();

  useEffect(() => {
    const fetchData = async () => {
      await getSensorBasicInformation(board_id);
    };
    fetchData();
  }, [getSensorBasicInformation])

  const handleMeasureAgain = async (): Promise<void> => {
    await measureCurrent(board_id);
  };

  const gaugeGap = clamp(Math.round(width * 0.02), 6, 16);

  const updateBoardFrequency = async (boardFrequency: number) => {
    setIsCustomEditFrequency(false);
    await setBoardFrequency(boardFrequency, board_id,
      () => {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Board frequency updated successfully.'
        });
      },
      (error: Error) => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to update board frequency.'
        })
      }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Measurement</Text>

        <View style={styles.measurementCard}>
          <View style={[styles.measurementRow, { gap: gaugeGap }]}>
            <HalfCircleGauge title="pH" value={currentSensorData?.ph ?? 0} unit="" min={0} max={14} threshold_max={7} threshold_min={5.5} extraHorizontalPadding={theme.spacing.md * 2} />
            <HalfCircleGauge title="Temperature" value={currentSensorData?.temperature ?? 0} unit="°C" min={-10} max={50} threshold_max={35} threshold_min={30} extraHorizontalPadding={theme.spacing.md * 2} />
            <HalfCircleGauge title="EC" value={currentSensorData?.ec ?? 0} unit="ms/cm" min={0} max={700} threshold_max={700} threshold_min={500} extraHorizontalPadding={theme.spacing.md * 2} />
          </View>

          <ButtonModalL
            text={"Measure"}
            onPress={handleMeasureAgain}
            filledColor={theme.colors.primary}
            textColor={theme.colors.white}
            marginBottom={3}
            loading={currentLoading}
          />

        </View>
        <View style={styles.frequencySection}>
          <Text style={styles.sectionSubtitle}>Board Frequency:</Text>
          {!isCustomEditFrequency ? <DropDownTemplate
            options={[`every ${frequency} second`, 'every 1 second', 'every 5 second', 'every 10 second', 'every 15 second', 'every 30 second', 'every 60 second', 'custom']}
            label={`selected: ${frequency} s`}
            onSelect={(value) => {
              if (value === 'custom') {
                setIsCustomEditFrequency(true);
              }
            }}
          />
          : <TextFieldSensorValue
            defaultValue={frequency}
            onChange={(value: number) => setFrequency(value)}
            height={35}
            width={150}
            fontSize={12}
          />}

          {!isCustomEditFrequency ?
            <IconButton
              onPress={() => {
                setIsCustomEditFrequency(true);
              }}
              source={require('@/assets/icons/pencil.png')}
              size={24}
              iconSize={20}

            /> : <TouchableOpacity
              style={[
                styles.submitFrequencyButton,
                loading && styles.submitFrequencyButtonDisabled
              ]}
              onPress={() => updateBoardFrequency(frequency)}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Ionicons
                name="checkmark"
                size={16}
                color={theme.colors.white}
              />
            </TouchableOpacity>}
        </View>

        <View style={styles.section}>
          <View style={styles.sensorHeaderContainer}>
            <Text style={styles.sectionTitle}>Sensors</Text>
          </View>
          <View>
            {sensorData?.map((sensor) => (
              <View key={sensor.id} style={styles.sensorContainer}>
                <SensorCard sensor={sensor} board_uuid={board_id} />
              </View>
            ))}
          </View>
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
    // marginTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  frequencySection : {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    // paddingVertical: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.header2,
    fontFamily: theme.fontFamily.semibold,
    color: '#333',
    alignSelf: 'center'
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  submitFrequencyButton: {
    backgroundColor: theme.colors.primary, // Green background
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
