import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
} from 'react-native';
import { themeStyle } from '@/src/theme';

interface ButtonPrimaryProps {
  text: string;
  filledColor?: string;
  borderColor?: string;
  textColor?: string;
  onPress?: (event: GestureResponderEvent) => void;
  /** NEW: allow sizing/overrides */
  width?: number;
  height?: number;
  style?: ViewStyle;
  disabled?: boolean;
}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  text,
  filledColor = themeStyle.colors.white,
  borderColor = themeStyle.colors.black,
  textColor = themeStyle.colors.black,
  onPress = () => {},
  width,
  height,
  style,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: filledColor,
          borderColor,
          ...(width ? { width } : null),
          ...(height ? { height } : null),
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: themeStyle.fontSize.description,
            fontFamily: themeStyle.fontFamily.bold,
          },
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontWeight: 'bold',
  },
});

export default ButtonPrimary;
