import React from 'react';
import { View, Text, TextInput } from 'react-native';

type Props = {
  name?: string;
  placeholder: string;
  borderColor: string;
  textColor: string;
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
          style={{
            marginBottom: 4,
            fontSize: 16,
            fontWeight: 'bold',
            color: textColor,
          }}
        >
          {name}
        </Text>
      )}

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
          fontSize: 16,
          color: textColor,
          backgroundColor: 'white',
        }}
      />
    </View>
  );
};

export default TextFieldModal;
