// TextFieldVerificationCode.tsx
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';

export type OTPRef = { clear: () => void };

interface Props {
  length?: number;
  value?: string;                        // optional controlled value
  onChangeText?: (code: string) => void; // fires on every change
  onCodeFilled?: (code: string) => void; // fires when fully filled
  isError?: boolean;
  autoFocus?: boolean;
}

const onlyDigits = (s: string) => s.replace(/\D/g, '');

const TextFieldVerificationCode = React.forwardRef<OTPRef, Props>(({
  length = 6,
  value,
  onChangeText,
  onCodeFilled,
  isError = false,
  autoFocus = false,
}, ref) => {
  const [codeArr, setCodeArr] = useState<string[]>(Array(length).fill(''));
  const inputs = useRef<Array<TextInput | null>>(Array(length).fill(null));

  // Controlled mode support
  useEffect(() => {
    if (value === undefined) return;
    const digits = onlyDigits(value).slice(0, length).split('');
    const next = Array(length).fill('');
    for (let i = 0; i < digits.length; i++) next[i] = digits[i];
    setCodeArr(next);
  }, [value, length]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      const next = Array(length).fill('');
      setCodeArr(next);
      onChangeText?.('');
      inputs.current[0]?.focus();
    },
  }));

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  const emit = (arr: string[]) => {
    const joined = arr.join('');
    onChangeText?.(joined);
    if (joined.length === length) onCodeFilled?.(joined);
  };

  const handleChange = (text: string, index: number) => {
    const sanitized = onlyDigits(text);

    // Deletion (empty text): clear this cell
    if (sanitized.length === 0) {
      const next = [...codeArr];
      next[index] = '';
      setCodeArr(next);
      emit(next);
      return;
    }

    // Single digit typed
    if (sanitized.length === 1) {
      const next = [...codeArr];
      next[index] = sanitized;
      setCodeArr(next);
      emit(next);
      if (index < length - 1) inputs.current[index + 1]?.focus();
      return;
    }

    // Paste multiple digits: distribute across cells starting here
    const next = [...codeArr];
    for (let i = 0; i < sanitized.length && index + i < length; i++) {
      next[index + i] = sanitized[i];
    }
    setCodeArr(next);
    emit(next);
    // Move focus to last filled or stay at end
    const last = Math.min(index + sanitized.length, length - 1);
    inputs.current[last]?.focus();
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key !== 'Backspace') return;

    if (codeArr[index] !== '') {
      // Clear current box if it has a digit
      const next = [...codeArr];
      next[index] = '';
      setCodeArr(next);
      emit(next);
      return;
    }

    // Current empty: move left and clear previous
    if (index > 0) {
      const prev = index - 1;
      const next = [...codeArr];
      next[prev] = '';
      setCodeArr(next);
      emit(next);
      inputs.current[prev]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {codeArr.map((char, index) => (
        <TextInput
          key={index}
          ref={(r) => { inputs.current[index] = r; }}
          value={char}
          onChangeText={(t) => handleChange(t, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          textContentType="oneTimeCode"       // iOS OTP autofill hint
          autoComplete="one-time-code"        // Android hint (RN newer versions)
          maxLength={1}
          style={[
            styles.input,
            {
              borderColor: isError ? '#F77979' : '#000',
              color: isError ? '#F77979' : '#000',
            },
          ]}
        />
      ))}
    </View>
  );
});

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
