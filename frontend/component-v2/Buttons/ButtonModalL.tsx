import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';

type ButtonSize = 'L' | 'XL' | '2XL' | '3XL';

interface ButtonModalLProps {
  text: string;
  filledColor?: string;
  textColor?: string;
  onPress?: (event: GestureResponderEvent) => void;
  marginBottom?: number;
  size?: ButtonSize;
}

const ButtonModalL: React.FC<ButtonModalLProps> = ({
  text,
  filledColor = '#FFFFFF',
  textColor = '#000000',
  onPress = () => { },
  marginBottom,
  size = 'L',
}) => {
  const sizeStyles = getSizeStyles(size);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        sizeStyles,
        {
          backgroundColor: filledColor,
          marginBottom: marginBottom ?? styles.button.marginVertical, // use prop if given
        },
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.text, sizeStyles.text, { color: textColor }]}>{text}</Text>
    </TouchableOpacity>
  );
};

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'L':
      return {
        width: 140,
        height: 36,
        paddingVertical: 8,
        paddingHorizontal: 16,
        text: { fontSize: 14 },
      };
    case 'XL':
      return {
        width: 180,
        height: 42,
        paddingVertical: 10,
        paddingHorizontal: 20,
        text: { fontSize: 16 },
      };
    case '2XL':
      return {
        width: 220,
        height: 48,
        paddingVertical: 12,
        paddingHorizontal: 24,
        text: { fontSize: 18 },
      };
    case '3XL':
      return {
        width: 260,
        height: 54,
        paddingVertical: 14,
        paddingHorizontal: 28,
        text: { fontSize: 20 },
      };
    default:
      return {
        width: 140,
        height: 36,
        paddingVertical: 8,
        paddingHorizontal: 16,
        text: { fontSize: 14 },
      };
  }
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  text: {
    fontWeight: 'bold',
  },
});

export default ButtonModalL;
