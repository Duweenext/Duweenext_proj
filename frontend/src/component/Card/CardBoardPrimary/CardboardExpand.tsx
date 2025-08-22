import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { theme } from '@/theme'; // Adjust path as needed
import { useBoard } from '@/src/api/hooks/useBoard';
import HalfCircleGauge from '../../Chart/GaugeChart';
import ButtonModalL from '../../Buttons/ButtonModalL';

interface MeasurementData {
  ph: number;
  ec: number;
  temperature: number;
}

interface Sensor {
  id: string;
  name: string;
  isConnected: boolean;
}

interface MeasurementDashboardProps {}

const { width, height } = Dimensions.get('window');

// tiny util for responsive clamping
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const CardBoardExpanded: React.FC<MeasurementDashboardProps> = () => {
  // const {getReturnById} = useBoard();
  const [measurementData, setMeasurementData] = useState<MeasurementData>({
    ph: 5.6,
    ec: 152,
    temperature: 32,
  });

  const [sensors, setSensors] = useState<Sensor[]>([
    { id: 'ph', name: 'Ph sensor', isConnected: true },
    { id: 'temperature', name: 'Temperature sensor', isConnected: true },
    { id: 'ec', name: 'EC sensor', isConnected: true },
  ]);

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

  const handleSensorToggle = (sensorId: string): void => {
    setSensors(prevSensors =>
      prevSensors.map(sensor =>
        sensor.id === sensorId
          ? { ...sensor, isConnected: !sensor.isConnected }
          : sensor
      )
    );
  };

  // ---- responsive values (using width from Dimensions) ----
  const gaugeGap = clamp(Math.round(width * 0.02), 6, 16); // ~2% of width
  const btnWidth = clamp(Math.round(width * 0.6), 220, 420); // 60% of screen
  const btnPadV = clamp(Math.round(width * 0.035), 10, 18); // vertical padding
  const btnRadius = clamp(Math.round(width * 0.06), 18, 28); // pill radius
  const btnFont = clamp(Math.round(width * 0.045), 14, 18); // label size

  return (
    <ScrollView style={styles.container}>
      {/* Measurement Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Measurement</Text>

        {/* Measurement Card */}
        <View style={styles.measurementCard}>
          {/* Measurement Values */}
          <View style={[styles.measurementRow, { gap: gaugeGap }]}>
            <HalfCircleGauge title="pH" value={measurementData.ph} unit="" min={4} max={9} extraHorizontalPadding={theme.spacing.md * 2}/>
            <HalfCircleGauge title="Temperature" value={measurementData.temperature} unit="°C" min={0} max={50} extraHorizontalPadding={theme.spacing.md * 2}/>
            <HalfCircleGauge title="EC" value={measurementData.ec} unit="ms/cm" min={0} max={500} extraHorizontalPadding={theme.spacing.md * 2}/>
          </View>

          {/* Measure Again Button */}
          <ButtonModalL
            text={isLoading ? "Measuring..." : "Measure Again"}
            onPress={handleMeasureAgain}
            filledColor={theme.colors.primary}
            textColor={theme.colors.white}
            // borderColor={theme.colors.primary}
            marginBottom={3}
            // You can add more props as needed
          />
        </View>

        {/* Sensors Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sensors</Text>

          {sensors.map((sensor) => (
            <View key={sensor.id} style={styles.sensorCard}>
              <View style={styles.sensorInfo}>
                <Text style={styles.sensorName}>{sensor.name}</Text>
                <Text style={styles.sensorStatus}>
                  Status: {sensor.isConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
              <View style={styles.sensorActions}>
                <TouchableOpacity
                  style={[
                    styles.disconnectButton,
                    !sensor.isConnected && styles.connectButton
                  ]}
                  onPress={() => handleSensorToggle(sensor.id)}
                >
                  <Text
                    style={[
                      styles.disconnectButtonText,
                      !sensor.isConnected && styles.connectButtonText
                    ]}
                  >
                    {sensor.isConnected ? 'Disconnect' : 'Connect'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.chevron}>›</Text>
              </View>
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
    marginBottom: theme.spacing.lg,
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
  sensorCard: {
    backgroundColor: theme.colors.primary,
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
  sensorStatus: {
    color: theme.colors.secondary,
    fontSize: theme.fontSize.data_text,
    fontFamily: theme.fontFamily.regular,
  },
  sensorActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
  chevron: {
    color: theme.colors.white,
    fontSize: theme.fontSize['2xl'],
    fontFamily: theme.fontFamily.bold,
  },
});

export default CardBoardExpanded;
