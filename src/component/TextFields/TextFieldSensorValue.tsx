import { sanitizeDecimalInput } from '@/src/utlis/input';
import React, { useState } from 'react';
import { View, TextInput } from 'react-native';

type Props = {
  defaultValue: string | number;
  onChange?: (value: number) => void;
  height?: number;
  width?: number;
  fontSize?: number;
  borderRadius?: number;
};

const TextFieldSensorValue: React.FC<Props> = ({
  defaultValue,
  onChange,
  height = 49,
  width = 76,
  fontSize = 16,
  borderRadius = 5,
}) => {
  const [value, setValue] = useState(String(defaultValue ?? ''));

  const handleChange = (text: string) => {
    const sanitized = sanitizeDecimalInput(text);
    setValue(sanitized);

    const numericValue = parseFloat(sanitized);
    onChange?.(isNaN(numericValue) ? 0 : numericValue);
  };

  return (
    <View style={{ width, height }}>
      <TextInput
        value={value}
        onChangeText={handleChange}
        keyboardType="numeric"
        style={{
          height,
          borderRadius,
          borderWidth: 1,
          paddingHorizontal: 12,
          backgroundColor: 'white',
          fontSize,
          color: '#1A736A',
          borderColor: '#E5E7EB',
        }}
      />
    </View>
  );
};

export default TextFieldSensorValue;
