import React from 'react';
import { View, Text, TextInput } from 'react-native';

type Props = {
  name?: string;
  placeholder: string;
  borderColor: string; // Accepts Tailwind-defined colors e.g. '#F77979'
  textColor: string;   // Accepts Tailwind-defined colors e.g. '#1A736A'
  value: string;
  onChangeText: (text: string) => void;
};

const TextFieldModal: React.FC<Props> = ({
  name,
  placeholder,
  borderColor,
  textColor,
  value,
  onChangeText,
}) => {
  return (
    <View style={{ width: 261 }}>
      
      {name && (
        <Text
          className="text-header-3 font-r-semibold mb-1"
          style={{ color: textColor }}
        >
          {name}
        </Text>
      )}

      {/* Input */}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        style={{
          height: 49,
          borderRadius: 5,
          borderWidth: 1,
          borderColor: borderColor,
          paddingHorizontal: 12,
          backgroundColor: 'white',
          color: textColor,
        }}
        className="font-r-regular text-text-field"
      /> 
    </View>
  );
};

export default TextFieldModal;
