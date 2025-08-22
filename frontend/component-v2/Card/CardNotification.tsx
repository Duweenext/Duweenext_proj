// component-v2/Card/CardNotification.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { theme as themeStyle } from '@/theme'; // keeping your naming
import { Trash2 } from 'lucide-react-native'; // optional; or swap with your icon set

interface NotificationCardProps {
  icon?: React.ReactNode;
  title: string;
  headline: string;
  message: string;
  time: string;
  style?: ViewStyle;
  onDelete?: () => void;               // NEW: delete handler
  rightAccessory?: React.ReactNode;    // optional hook for extra actions
}

export const CardNotification: React.FC<NotificationCardProps> = ({
  icon,
  title,
  headline,
  message,
  time,
  style,
  onDelete,
  rightAccessory,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {icon}
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.headerRight}>
          {rightAccessory}
          {!!time && <Text style={styles.time}>{time}</Text>}
          {onDelete && (
            <TouchableOpacity
              accessibilityLabel="Delete notification"
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              onPress={onDelete}
              style={styles.deleteBtn}
            >
              {/* if you don't use lucide, replace with your own icon or "🗑️" */}
              <Trash2 size={18} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: themeStyle.colors.primary,
    borderRadius: parseInt(themeStyle.borderRadius.lg, 10),
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: {
    marginLeft: 8,
    fontSize: parseInt(themeStyle.fontSize['header-2'], 10),
    fontFamily: themeStyle.fontFamily.semibold,
    color: '#FFFFFF',
  },
  time: {
    fontSize: parseInt(themeStyle.fontSize.description, 10),
    fontFamily: themeStyle.fontFamily.regular,
    color: '#FFFFFF',
  },
  deleteBtn: { marginLeft: 8 },
  headline: {
    fontSize: parseInt(themeStyle.fontSize.description, 10),
    fontFamily: themeStyle.fontFamily.medium,
    color: themeStyle.colors.warning, // orange
    marginBottom: 4,
  },
  message: {
    fontSize: parseInt(themeStyle.fontSize.description, 10),
    fontFamily: themeStyle.fontFamily.regular,
    color: '#FFFFFF',
    lineHeight: 22,
  },
});
