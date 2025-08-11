// TextFieldVerificationCode.tsx
import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { sanitizeIntegerInput } from '../../src/utlis/input';

interface Props {
  length?: number;
  onCodeFilled?: (code: string) => void;
  isError?: boolean;
}

const TextFieldVerificationCode: React.FC<Props> = ({
  length = 6,
  onCodeFilled,
  isError = false,
}) => {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));

  // ✅ Pre-fill the array to match TextInput refs
  const inputs = useRef<Array<TextInput | null>>(Array(length).fill(null));

  const handleChange = (text: string, index: number) => {
    const sanitized = sanitizeIntegerInput(text);
    if (!sanitized) return;

    const newCode = [...code];
    newCode[index] = sanitized;
    setCode(newCode);

    if (sanitized && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (newCode.every((char) => char !== '')) {
      onCodeFilled?.(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {code.map((char, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputs.current[index] = ref;
          }}
          value={char}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          style={[
            styles.input,
            {
              borderColor: isError ? '#F77979' : 'black',
              color: isError ? '#F77979' : 'black',
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: 38,
    height: 55,
    borderWidth: 2,
    borderRadius: 10,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default TextFieldVerificationCode;
