import { sanitizeDecimalInput } from '@/src/utlis/input';
import React, { useState } from 'react';
import { View, TextInput } from 'react-native';// adjust path as needed

type Props = {
  defaultValue: string;
  onChange?: (value: string) => void;
};

const TextFieldSensorValue: React.FC<Props> = ({
  defaultValue,
  onChange,
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (text: string) => {
    const sanitized = sanitizeDecimalInput(text);
    setValue(sanitized);
    onChange?.(sanitized);
  };

  return (
    <View style={{ width: 76, height: 26}}>
      <TextInput
        value={value}
        onChangeText={handleChange}
        keyboardType="numeric"
        style={{
          height: 49,
          borderRadius: 5,
          borderWidth: 1,
          paddingHorizontal: 12,
          backgroundColor: 'white',
          fontSize: 16,
          color: '#1A736A',       // Constant text color
          borderColor: '#E5E7EB', // Optional soft border
        }}
      />
    </View>
  );
};

export default TextFieldSensorValue;
