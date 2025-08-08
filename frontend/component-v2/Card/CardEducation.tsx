// components/InfoCard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
  Platform,
} from 'react-native';
import { theme } from '@/theme';

interface InfoCardProps {
  /** The title shown below the icon */
  title: string;
  /** Any React node you want to render as the icon */
  icon: React.ReactNode;
  /** Optional press handler */
  onPress?: (e: GestureResponderEvent) => void;
  /** Override or extend container style */
  style?: ViewStyle;
}

export const CardEducation: React.FC<InfoCardProps> = ({
  title,
  icon,
  onPress,
  style,
}) => {
  // Use TouchableOpacity only if onPress is provided
  const Container: React.ComponentType<any> = onPress
    ? TouchableOpacity
    : View;

  return (
    <Container
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconWrapper}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.primary,                // teal border
    borderRadius: parseInt(theme.borderRadius.lg, 10),// large rounded corners
    paddingHorizontal: 24,
    paddingVertical: 24,
    // aspectRatio: 3 / 4,                               // keep a card-ish shape
    alignItems: 'center',
    justifyContent: 'flex-start',
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
  iconWrapper: {
    marginBottom: 24,
  },
  title: {
    fontSize: parseInt(theme.fontSize.description, 10),    // ~16px
    fontFamily: theme.fontFamily.medium,         // semibold
    color: '#000000',
    textAlign: 'center',
  },
});
