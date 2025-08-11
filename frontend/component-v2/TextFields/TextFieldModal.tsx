import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { themeStyle } from '../../app/theme';
import { validateText } from '../../srcs/utlis/input';

type Props = {
  name?: string;
  placeholder: string;
  borderColor?: string;  // pass tokens like themeStyle.colors.primary
  textColor?: string;    // pass tokens like themeStyle.colors.black
  value: string;
  onChangeText: (text: string) => void;
};

// Helper to get rgba from a theme hex (for placeholder)
const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const TextFieldModal: React.FC<Props> = ({
  name,
  placeholder,
  borderColor = themeStyle.colors.primary,
  textColor = themeStyle.colors.black,
  value,
  onChangeText,
}) => {
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (text: string) => {
    const error = validateText(text);
    setErrorMessage(error);
    if (!error || text === '') onChangeText(text);
  };

  return (
    <View style={{ width: '100%' }}>
      {name && (
        <Text
          style={{
            marginBottom: 4,
            fontSize: themeStyle.fontSize.description,
            fontFamily: themeStyle.fontFamily.semibold,
            color: textColor,
          }}
        >
          {name}
        </Text>
      )}

      <TextInput
        placeholder={placeholder}
        placeholderTextColor={hexToRgba(themeStyle.colors.black, 0.4)}
        value={value}
        onChangeText={handleInputChange}
        style={{
          height: 49,
          borderRadius: 5,
          borderWidth: 1,
          paddingHorizontal: 12,
          backgroundColor: themeStyle.colors.white,
          fontSize: themeStyle.fontSize.description,
          fontFamily: themeStyle.fontFamily.regular,
          color: textColor,
          borderColor: borderColor,
        }}
      />

      {errorMessage ? (
        <Text
          style={{
            marginTop: 4,
            color: themeStyle.colors.fail,
            fontSize: themeStyle.fontSize.data_text,
            fontFamily: themeStyle.fontFamily.medium,
          }}
        >
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
};

export default TextFieldModal;
