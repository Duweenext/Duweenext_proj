// TextFieldModal.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { themeStyle } from '@/src/theme';

type Mode = 'text' | 'password';
type InputKind = 'none' | 'letters' | 'email' | 'ssid';
type ErrorPlacement = 'above' | 'below';

type Props = {
  type?: Mode;
  inputKind?: InputKind;
  name?: string;                    
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  borderColor?: string;
  textColor?: string;
  secureToggle?: boolean;           
  errorPlacement?: ErrorPlacement;  
  externalError?: string;           
  onBlur?: () => void;
  onFocus?: () => void;
  containerStyle?: object;
  inputStyle?: object;
};

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const TextFieldModal: React.FC<Props> = ({
  type = 'text',
  inputKind = 'none',
  name,
  placeholder,
  value,
  onChangeText,
  borderColor,
  textColor = themeStyle.colors.black,
  secureToggle = true,
  errorPlacement = 'below',
  externalError,
  onBlur,
  onFocus,
  containerStyle,
  inputStyle,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordMode = type === 'password';

  // Minimal, non-opinionated normalization only
  const handleChange = (text: string) => {
    if (isPasswordMode) {
      onChangeText(text);
      return;
    }
    if (inputKind === 'letters') {
      onChangeText(text.replace(/[^A-Za-z\s]/g, ''));
      return;
    }
    if (inputKind === 'email') {
      onChangeText(text.replace(/\s+/g, ' ').trimStart());
      return;
    }
    if (inputKind === 'ssid') {
      onChangeText(text.replace(/[^\x20-\x7E]/g, ''));
      return;
    }
    onChangeText(text);
  };

  const resolvedBorderColor =
    externalError ? themeStyle.colors.fail : (borderColor ?? themeStyle.colors.primary);

  const ErrorText = () =>
    externalError ? (
      <Text
        style={{
          marginTop: errorPlacement === 'below' ? 4 : 0,
          marginBottom: errorPlacement === 'above' ? 6 : 0,
          color: themeStyle.colors.fail,
          fontSize: themeStyle.fontSize.data_text,
          fontFamily: themeStyle.fontFamily.medium,
        }}
      >
        {externalError}
      </Text>
    ) : null;

  return (
    <View style={[{ width: '100%' }, containerStyle]}>
      {name && (
        <Text
          style={{
            marginBottom: 6,
            fontSize: themeStyle.fontSize.data_text,
            fontFamily: themeStyle.fontFamily.semibold,
            color: textColor,
          }}
        >
          {name}
        </Text>
      )}

      {errorPlacement === 'above' ? <ErrorText /> : null}

      <View style={{ position: 'relative' }}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={hexToRgba(themeStyle.colors.black, 0.4)}
          value={value}
          onChangeText={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          secureTextEntry={isPasswordMode && !showPassword}
          autoCapitalize={inputKind === 'email' ? 'none' : 'sentences'}
          keyboardType={inputKind === 'email' ? 'email-address' : 'default'}
          style={[
            {
              height: 49,
              borderRadius: 8,
              borderWidth: 1,
              paddingHorizontal: 12,
              backgroundColor: themeStyle.colors.white,
              fontSize: themeStyle.fontSize.description,
              fontFamily: themeStyle.fontFamily.regular,
              color: textColor,
              borderColor: resolvedBorderColor,
              paddingRight: isPasswordMode && secureToggle ? 42 : 12,
            },
            inputStyle,
          ]}
        />

        {isPasswordMode && secureToggle && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
            style={{
              position: 'absolute',
              right: 10,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              width: 28,
            }}
          >
            {showPassword ? <EyeOff size={22} color="grey" /> : <Eye size={22} color="grey" />}
          </TouchableOpacity>
        )}
      </View>

      {errorPlacement === 'below' ? <ErrorText /> : null}
    </View>
  );
};

export default TextFieldModal;
