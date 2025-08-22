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
import { theme, themeStyle } from '@/theme';

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
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: themeStyle.colors.white,
        borderRadius: 5,
        padding: 10,
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
      }}
    >
      <Text style={{
        fontSize: themeStyle.fontSize.description, 
        fontFamily: themeStyle.fontFamily.medium,
        color: themeStyle.colors.black,
      }}>{title}</Text>
      <Ionicons name="chevron-forward" size={24} color="#999999" />
    </TouchableOpacity>
  );
};

