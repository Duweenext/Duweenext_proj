// components/HealthStatusCard.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import { theme } from '@/theme';

interface HealthStatusCardProps {
  status: string;
  timeLabel: string;
  imageSource?: ImageSourcePropType;
  message: string;
  style?: ViewStyle;
}

export const CardImageProcessingHistory: React.FC<HealthStatusCardProps> = ({
  status,
  timeLabel,
  imageSource,
  message,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.statusText}>Health Status: {status}</Text>
        <Text style={styles.timeText}>{timeLabel}</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Image source={imageSource} style={styles.image} />
        <Text style={styles.messageText}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: parseInt(theme.borderRadius.sm, 10),
    padding: 16,
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: parseInt(theme.fontSize['header2'], 10),   // e.g. 20px
    fontFamily: theme.fontFamily['r-semibold'][0],
    color: '#000000',
    flexShrink: 1,
  },
  timeText: {
    fontSize: parseInt(theme.fontSize['description'], 10), // e.g. 16px
    fontFamily: theme.fontFamily['r-medium'][0],
    color: '#000000',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  image: {
    width: 120,
    height: 80,
    borderRadius: parseInt(theme.borderRadius.md, 10),
    marginRight: 12,
  },
  messageText: {
    flex: 1,
    fontSize: parseInt(theme.fontSize['description'], 10),
    fontFamily: theme.fontFamily['r-regular'][0],
    color: '#000000',
    lineHeight: 22,
  },
});
