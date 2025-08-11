import React from 'react';
import { TouchableOpacity, Text, GestureResponderEvent } from 'react-native';
import { themeStyle } from '../../src/theme';

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
  filledColor = themeStyle.colors.white,
  textColor = themeStyle.colors.black,
  onPress = () => {},
  marginBottom,
  size = 'L',
}) => {
  const sizeStyles = getSizeStyles(size);

  return (
    <TouchableOpacity
      style={{
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 6,
        backgroundColor: filledColor,
        marginBottom: marginBottom ?? 6,
        ...sizeStyles,
      }}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text
        style={{
          fontFamily: themeStyle.fontFamily.medium,
          fontSize: sizeStyles.text.fontSize,
          color: textColor,
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

// keep size-specific styles separate
const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'L':
      return {
        width: 140,
        height: 36,
        paddingVertical: 8,
        paddingHorizontal: 16,
        text: { fontSize: themeStyle.fontSize.data_text},
      };
    case 'XL':
      return {
        width: 180,
        height: 42,
        paddingVertical: 10,
        paddingHorizontal: 20,
        text: { fontSize: themeStyle.fontSize.description },
      };
    case '2XL':
      return {
        width: 220,
        height: 48,
        paddingVertical: 12,
        paddingHorizontal: 24,
        text: { fontSize: themeStyle.fontSize.descriptionL },
      };
    case '3XL':
      return {
        width: 260,
        height: 54,
        paddingVertical: 14,
        paddingHorizontal: 28,
        text: { fontSize: themeStyle.fontSize.header2 },
      };
    default:
      return {
        width: 140,
        height: 36,
        paddingVertical: 8,
        paddingHorizontal: 16,
        text: { fontSize: themeStyle.fontSize.xs },
      };
  }
};

export default ButtonModalL;
