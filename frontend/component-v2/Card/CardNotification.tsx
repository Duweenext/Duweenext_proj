// components/NotificationCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { theme } from '@/theme';

interface NotificationCardProps {
  icon: React.ReactNode;
  title: string;
  headline: string;
  message: string;
  time: string;
  style?: ViewStyle;
}

export const CardNotification: React.FC<NotificationCardProps> = ({
  icon,
  title,
  headline,
  message,
  time,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {icon}
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.time}>{time}</Text>
      </View>

      {/* Headline */}
      <Text style={styles.headline}>{headline}</Text>
      {/* Message */}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: theme.colors.primary,                   // green bg
    borderRadius: parseInt(theme.borderRadius.lg, 10),       // rounded corners
    padding: 16,
    // shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 8,
    fontSize: parseInt(theme.fontSize['header-2'], 10),     // ~20px
    fontFamily: theme.fontFamily.semibold,
    color: '#FFFFFF',
  },
  time: {
    fontSize: parseInt(theme.fontSize['description'], 10),
    fontFamily: theme.fontFamily.regular,
    color: '#FFFFFF',
  },
  headline: {
    fontSize: parseInt(theme.fontSize.description, 10),
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.warning,                             // orange text
    marginBottom: 4,
  },
  message: {
    fontSize: parseInt(theme.fontSize.description, 10),
    fontFamily: theme.fontFamily.regular,
    color: '#FFFFFF',
    lineHeight: 22,
  },
});
