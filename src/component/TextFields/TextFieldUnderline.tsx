// UnderlineTextField.tsx
import React, { forwardRef, useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string | boolean;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  editable?: boolean;
  /** Optional styles to tweak layout without expanding API */
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  width?: number ;
};

const UnderlineTextField = forwardRef<TextInput, Props>(
  (
    {
      value,
      onChangeText,
      placeholder,
      label,
      error,
      secureTextEntry,
      keyboardType,
      autoCapitalize = 'none',
      editable = true,
      style,
      inputStyle,
      width,
      ...rest
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const hasError = Boolean(error);

    return (
      <View style={style}>
        {label ? <Text style={styles.label}>{label}</Text> : null}

        <View
          style={[
            styles.inputWrap,
            !editable && styles.inputWrapDisabled,
          ]}
        >
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9AA0A6"
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            editable={editable}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={[styles.input, inputStyle, {width: width}]}
            {...rest}
          />
          <View
            style={[
              styles.underline,
              focused && styles.underlineFocused,
              hasError && styles.underlineError,
              !editable && styles.underlineDisabled,
            ]}
          />
        </View>

        {typeof error === 'string' && !!error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  }
);

export default UnderlineTextField;

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    color: '#5F6368',
    marginBottom: 4,
  },
  inputWrap: {
    paddingTop: 2,
    paddingBottom: 6,
  },
  inputWrapDisabled: {
    opacity: 0.6,
  },
  input: {
    fontSize: 16,
    paddingVertical: 6,
  },
  underline: {
    height: 1,
    backgroundColor: '#DADCE0', // base
  },
  underlineFocused: {
    height: 2,
    backgroundColor: '#1A73E8', // focus blue
  },
  underlineError: {
    height: 2,
    backgroundColor: '#D93025', // error red
  },
  underlineDisabled: {
    backgroundColor: '#E0E0E0',
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#D93025',
  },
});
