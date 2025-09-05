import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { themeStyle } from '@/src/theme';
import { validateText } from '@/src/utlis/input';

type Mode = 'text' | 'password-old' | 'password-new' | 'password-confirm';
type InputKind = 'none' | 'letters' | 'email';
type ErrorPlacement = 'above' | 'below';

type Props = {
  mode?: Mode;
  inputKind?: InputKind;
  name?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  borderColor?: string;
  textColor?: string;
  confirmAgainst?: string;
  oldPasswordError?: string;
  secureToggle?: boolean;
  errorPlacement?: ErrorPlacement;
  externalError?: string;
};

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getStrength = (pwd: string) => {
  if (!pwd) return { label: '', color: '', ratio: 0 };
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNum   = /\d/.test(pwd);
  const hasSym   = /[^A-Za-z0-9]/.test(pwd);
  const long8    = pwd.length >= 8;
  const scoreArr = [hasLower, hasUpper, hasNum, hasSym, long8];
  const score = scoreArr.filter(Boolean).length;
  const ratio = score / scoreArr.length;

  if (score <= 2) return { label: 'Weak',   color: themeStyle.colors.fail,    ratio };
  if (score <= 4) return { label: 'Medium', color: themeStyle.colors.warning, ratio };
  return          { label: 'Strong', color: themeStyle.colors.success, ratio };
};

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const TextFieldModal: React.FC<Props> = ({
  mode = 'text',
  inputKind = 'none',
  name,
  placeholder,
  value,
  onChangeText,
  borderColor,
  textColor = themeStyle.colors.black,
  confirmAgainst,
  oldPasswordError,
  secureToggle = true,
  errorPlacement = 'below',
  externalError,
}) => {
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordMode =
    mode === 'password-old' || mode === 'password-new' || mode === 'password-confirm';

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
    onChangeText(text);
  };

  let liveError = '';
  if (mode === 'text') {
    if (inputKind === 'email') {
      liveError = value && !isValidEmail(value.trim()) ? 'Invalid email address' : '';
    } else if (inputKind === 'letters') {
      liveError = '';
    } else {
      liveError = validateText(value) || '';
    }
  } else if (mode === 'password-confirm') {
    liveError = value && confirmAgainst && value !== confirmAgainst ? 'Passwords do not match' : '';
  }

  const oldPwdSkipError =
    mode === 'password-old' && touched && value.trim().length === 0
      ? 'Please enter your current password'
      : '';

  const strength = useMemo(
    () => (mode === 'password-new' && value ? getStrength(value) : { label: '', color: '', ratio: 0 }),
    [mode, value]
  );

  const computedError =
    externalError ||
    (mode === 'password-old' ? (oldPasswordError || oldPwdSkipError) : liveError) ||
    '';

  const resolvedBorderColor =
    computedError ? themeStyle.colors.fail : (borderColor ?? themeStyle.colors.primary);

  const StrengthBar = () =>
    mode === 'password-new' && strength.label ? (
      <>
        <View
          style={{
            height: 6,
            borderRadius: 3,
            backgroundColor: hexToRgba(themeStyle.colors.black, 0.15),
            marginTop: 8,
            overflow: 'hidden',
          }}
        >
          <View style={{ width: `${Math.floor(strength.ratio * 100)}%`, height: '100%', backgroundColor: strength.color }} />
        </View>
        <Text
          style={{
            marginTop: 4,
            color: strength.color,
            fontSize: themeStyle.fontSize.data_text,
            fontFamily: themeStyle.fontFamily.medium,
          }}
        >
          {strength.label}
        </Text>
      </>
    ) : null;

  const ErrorText = () =>
    computedError ? (
      <Text
        style={{
          marginTop: errorPlacement === 'below' ? 4 : 0,
          marginBottom: errorPlacement === 'above' ? 6 : 0,
          color: themeStyle.colors.fail,
          fontSize: themeStyle.fontSize.data_text,
          fontFamily: themeStyle.fontFamily.medium,
        }}
      >
        {computedError}
      </Text>
    ) : null;

  return (
    <View style={{ width: '100%' }}>
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
          onBlur={() => setTouched(true)}
          secureTextEntry={isPasswordMode && !showPassword}
          autoCapitalize={inputKind === 'email' ? 'none' : 'sentences'}
          keyboardType={inputKind === 'email' ? 'email-address' : 'default'}
          style={{
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
          }}
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

      <StrengthBar />
    </View>
  );
};

export default TextFieldModal;
