// components/SensorCard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { Sensor } from '@/src/interfaces/board'; // adjust path to your Sensor interface

interface SensorCardProps {
  sensor: Sensor;
  /** Called when the chevron is tapped */
  onCardPress?: (e: GestureResponderEvent) => void;
  /** Called when Connect/Disconnect is tapped */
  onButtonPress?: (e: GestureResponderEvent) => void;
  style?: object;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  sensor,
  onCardPress,
  onButtonPress,
  style,
}) => {
  const isConnected = sensor.sensor_status.toLowerCase() === 'connected';

  const bgColor = isConnected
    ? theme.colors.primary
    : theme.colors['background-1'];
  const textColor = isConnected ? '#FFFFFF' : '#000000';
  const buttonLabel = isConnected ? 'Disconnect' : 'Connect';

  return (
    <View style={[styles.card, { backgroundColor: bgColor }, style]}>
      {/* Row 1: Title + Chevron */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: textColor }]}>
          {sensor.sensor_name}
        </Text>
        {onCardPress && (
          <TouchableOpacity onPress={onCardPress} style={styles.iconButton}>
            <Ionicons name="chevron-forward" size={24} color={textColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Row 2: Status + Action Button */}
      <View style={styles.bodyRow}>
        <Text style={[styles.status, { color: textColor }]}>
          Status: {sensor.sensor_status}
        </Text>
        {onButtonPress && (
          <TouchableOpacity
            onPress={onButtonPress}
            style={[styles.actionButton, { backgroundColor: '#FFFFFF' }]}
          >
            <Text style={[styles.buttonText, { color: bgColor }]}>
              {buttonLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: parseInt(theme.borderRadius.lg, 10),
    padding: 16,
    marginVertical: 8,
    // shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: parseInt(theme.fontSize['header-2'], 10),
    fontFamily: theme.fontFamily['r-semibold'][0],
    flexShrink: 1,
  },
  iconButton: {
    padding: 4,
  },
  bodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    fontSize: parseInt(theme.fontSize.description, 10),
    fontFamily: theme.fontFamily['r-regular'][0],
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: parseInt(theme.borderRadius.md, 10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: parseInt(theme.fontSize.description, 10),
    fontFamily: theme.fontFamily['r-medium'][0],
  },
});
