// components/PondHealthCard.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface PondHealthCardProps {
  /** Top‐level heading (defaults to “Pond Health”) */
  title?: string;
  /** e.g. “Healthy”, “Unable to connect” */
  healthStatus: string;
  /** The longer body text under the status */
  message: string;
  /** Optional style override for the outer container */
  style?: ViewStyle;
}

export const CardImageProcessingResult: React.FC<PondHealthCardProps> = ({
  title = 'Pond Health',
  healthStatus,
  message,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.status}>
        Health Status: <Text>{healthStatus}</Text>
      </Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.primary,         // green background
    padding: 16,                                    // ~p-4
    borderRadius: parseInt(theme.borderRadius.lg),  // ~rounded-lg
    gap: 8,                                      // ~space-y-2
  },
  title: {
    fontSize: parseInt(theme.fontSize['header1'], 10),      // ~20px
    fontFamily: theme.fontFamily.semibold,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  status: {
    fontSize: parseInt(theme.fontSize.description, 10),     // ~16px
    fontFamily: theme.fontFamily.medium,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statusValue: {
    fontFamily: theme.fontFamily.medium,
  },
  message: {
    fontSize: parseInt(theme.fontSize.description, 10),
    fontFamily: theme.fontFamily.regular,
    color: '#FFFFFF',
    lineHeight: 22,   // gives a bit of breathing space
  },
});
