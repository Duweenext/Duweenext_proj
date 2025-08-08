import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { validateText } from '../../srcs/utlis/input'; 

type Props = {
  name?: string;
  placeholder: string;
  borderColor: string; // e.g., '#FFFFFF'
  textColor: string;   // e.g., '#FFFFFF'
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
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (text: string) => {
    const error = validateText(text); // validateText returns string
    setErrorMessage(error);
    if (!error || text === '') {
      onChangeText(text);
    }
  };

  return (
    <View style={{ width: '100%' }}>
      {name && (
        <Text
          style={{
            marginBottom: 4,
            fontSize: 16,
            fontWeight: '600',
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
        onChangeText={handleInputChange}
        style={{
          height: 49,
          borderRadius: 5,
          borderWidth: 1,
          paddingHorizontal: 12,
          backgroundColor: 'white',
          fontSize: 16,
          color: textColor,
          borderColor: borderColor,
        }}
      />

      {errorMessage ? (
        <Text style={{ marginTop: 4, color: '#F77979', fontSize: 14 }}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
};

export default TextFieldModal;
