import { themeStyle } from '@/src/theme';
import React from 'react';
import { TouchableOpacity, Text, GestureResponderEvent } from 'react-native';
import LoadingSpinner from '../Others/LoadingIndicator';

type Size = 'XS' | 'S'| 'M' | 'L' | 'XL' | '2XL' | '3XL';

interface ButtonModalLProps {
  text: string;
  filledColor?: string;
  textColor?: string;
  onPress?: (event: GestureResponderEvent) => void;
  marginBottom?: number;
  size?: Size;
  loading?: boolean;
  borderRadius?: Size;
  width?: number | string;
  height?: number;
}

const ButtonModalL: React.FC<ButtonModalLProps> = ({
  text,
  filledColor = themeStyle.colors.white,
  textColor = themeStyle.colors.black,
  onPress = () => {},
  marginBottom,
  size = 'L',
  loading = false,
  borderRadius = 'L',
  width,
  height,
}) => {
  const sizeStyles = getSizeStyles(size);
  const borderRadiusStyle = getBorderRadius(borderRadius);

  return (
    <TouchableOpacity
      style={{
        borderRadius: borderRadiusStyle,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 6,
        backgroundColor: filledColor,
        marginBottom: marginBottom ?? 6,

        ...sizeStyles,
      }}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? 
      <LoadingSpinner size="small" color={textColor} /> :
      <Text
        style={{
          fontFamily: themeStyle.fontFamily.medium,
          fontSize: sizeStyles.text.fontSize,
          color: textColor,
        }}
      >
        {text}
      </Text>}
    </TouchableOpacity>
  );
};

const getBorderRadius = (size: Size) => {
  switch (size) {
    case 'XS':
      return 4;
    case 'S':
      return 10;
    case 'M':
      return 12;
    case 'L':
      return 14;
    case 'XL':
      return 16;
    case '2XL':
      return 18;
    case '3XL':
      return 20;
    default:
      return 12;
  }
};

const getSizeStyles = (size: Size) => {
  switch (size) {
    case 'XS':
      return {
        width: 80,
        height: 24,
        paddingVertical: 4,
        paddingHorizontal: 8,
        text: { fontSize: themeStyle.fontSize.xs },
      };
    case 'S':
      return {
        width: 100,
        height: 28,
        paddingVertical: 5,
        paddingHorizontal: 10,
        text: { fontSize: themeStyle.fontSize.xs },
      };
    case 'M':
      return {
        width: 120,
        height: 32,
        paddingVertical: 6,
        paddingHorizontal: 12,
        text: { fontSize: themeStyle.fontSize.xs },
      };
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
