import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';

type ButtonSize = 'L' | 'XL' | '2XL' | '3XL';

interface ButtonModalXLProps {
  text: string;
  filledColor?: string;
  textColor?: string;
  onPress?: (event: GestureResponderEvent) => void;
  size?: ButtonSize;
}

const ButtonModalXL: React.FC<ButtonModalXLProps> = ({
  text,
  filledColor = '#227C71', // default green like in your design
  textColor = '#FFFFFF',
  onPress = () => {},
  size = 'XL',
}) => {
  const sizeStyles = getSizeStyles(size);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        sizeStyles,
        { backgroundColor: filledColor },
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
        width: 180,
        height: 40,
        paddingVertical: 8,
        paddingHorizontal: 12,
        text: { fontSize: 14 },
      };
    case 'XL':
      return {
        width: 261,
        height: 49,
        paddingVertical: 12,
        paddingHorizontal: 16,
        text: { fontSize: 16 },
      };
    case '2XL':
      return {
        width: 300,
        height: 56,
        paddingVertical: 16,
        paddingHorizontal: 20,
        text: { fontSize: 18 },
      };
    case '3XL':
      return {
        width: 380,
        height: 64,
        paddingVertical: 20,
        paddingHorizontal: 24,
        text: { fontSize: 20 },
      };
    default:
      return {
        width: 261,
        height: 49,
        paddingVertical: 12,
        paddingHorizontal: 16,
        text: { fontSize: 16 },
      };
  }
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    // marginVertical: 10,

    // Optional elevation / shadow
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  text: {
    fontWeight: 'bold',
  },
});

export default ButtonModalXL;
