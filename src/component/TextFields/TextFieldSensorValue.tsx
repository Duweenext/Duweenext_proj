import { sanitizeDecimalInput } from '@/src/utlis/input';
import React, { useState } from 'react';
import { View, TextInput } from 'react-native';// adjust path as needed

type Props<T = string> = {
  defaultValue: T;
  onChange?: (value: T) => void;
  height? : number
  width? : number
  fontSize? : number
  borderRadius? : number
};

const TextFieldSensorValue = <T = string>({
  defaultValue,
  onChange,
  height = 49,
  width = 76,
  fontSize = 16,
  borderRadius = 5,
}: Props<T>): React.ReactElement => {
  const [value, setValue] = useState(String(defaultValue));

  const handleChange = (text: string) => {
    const sanitized = sanitizeDecimalInput(text);
    setValue(sanitized);
    
    let convertedValue: T;
    if (typeof defaultValue === 'number') {
      convertedValue = (parseFloat(sanitized) || 0) as T;
    } else {
      convertedValue = sanitized as T;
    }
    
    onChange?.(convertedValue);
  };

  return (
    <View style={{ width: width, height: 26}}>
      <TextInput
        value={value}
        onChangeText={handleChange}
        keyboardType="numeric"
        style={{
          height: height,
          borderRadius: borderRadius,
          borderWidth: 1,
          paddingHorizontal: 12,
          // paddingVertical: 6,
          backgroundColor: 'white',
          fontSize: fontSize,
          color: '#1A736A',  
          borderColor: '#E5E7EB',
          alignItems: 'center',
          alignContent: 'center',
        }}
      />
    </View>
  );
};

export default TextFieldSensorValue;
