// components/SettingCard.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

interface SettingCardProps {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  style?: ViewStyle;
}

export const SettingCard: React.FC<SettingCardProps> = ({
  title,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, style]}
    >
      <Text style={styles.title}>{title}</Text>
      <Ionicons name="chevron-forward" size={24} color="#999999" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: parseInt(theme.borderRadius.sm, 10),  // large rounded corners
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors['background1'],          // light gray border
    // optional shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  title: {
    fontSize: parseInt(theme.fontSize['header2'], 10),  // ~20px
    fontFamily: theme.fontFamily.medium,
    color: '#000000',
  },
});
