import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { themeStyle } from '../../src/theme';
import { validateText } from '../../src/utlis/input';
import { Eye, EyeOff } from 'lucide-react-native';

type Mode = 'text' | 'password-old' | 'password-new' | 'password-confirm';
type InputKind = 'none' | 'letters' | 'email';

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
};

// hex -> rgba
const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Strength calc → label, color, percent (for bar)
const calcStrength = (pwd: string) => {
  if (!pwd) return { label: '', color: '', percent: 0 };
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNum   = /\d/.test(pwd);
  const hasSym   = /[^A-Za-z0-9]/.test(pwd);
  const long8    = pwd.length >= 8;
  const score = [hasLower, hasUpper, hasNum, hasSym, long8].filter(Boolean).length; // 0..5

  if (score <= 2) return { label: 'Weak',   color: themeStyle.colors.fail,    percent: 33 };
  if (score <= 4) return { label: 'Medium', color: themeStyle.colors.warning, percent: 66 };
  return              { label: 'Strong', color: themeStyle.colors.success, percent: 100 };
};

// email validator
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
}) => {
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordMode =
    mode === 'password-old' || mode === 'password-new' || mode === 'password-confirm';

  // Input sanitization for text kinds
  const handleChange = (text: string) => {
    if (isPasswordMode) { onChangeText(text); return; }
    if (inputKind === 'letters') { onChangeText(text.replace(/[^A-Za-z\s]/g, '')); return; }
    if (inputKind === 'email') { onChangeText(text.replace(/\s+/g, ' ').trimStart()); return; }
    onChangeText(text);
  };

  // Validation
  let liveError = '';
  if (mode === 'text') {
    if (inputKind === 'email') {
      liveError = value && !isValidEmail(value.trim()) ? 'Invalid email address' : '';
    } else if (inputKind === 'letters') {
      liveError = ''; // sanitized already
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

  const combinedOldPwdError = oldPasswordError || oldPwdSkipError;
  const errorMessage = (mode === 'password-old' ? combinedOldPwdError : liveError) || '';

  const strength = useMemo(
    () => (mode === 'password-new' && value ? calcStrength(value) : { label: '', color: '', percent: 0 }),
    [mode, value]
  );

  const resolvedBorderColor = errorMessage
    ? themeStyle.colors.fail
    : (borderColor ?? themeStyle.colors.primary);

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
            borderRadius: 12,
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
              width: 32,
            }}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={24} color={hexToRgba(themeStyle.colors.black, 0.6)} /> :
                            <Eye    size={24} color={hexToRgba(themeStyle.colors.black, 0.6)} />}
          </TouchableOpacity>
        )}
      </View>

      {/* Error (for old/confirm/email) */}
      {errorMessage ? (
        <Text
          style={{
            marginTop: 6,
            color: themeStyle.colors.fail,
            fontSize: themeStyle.fontSize.data_text,
            fontFamily: themeStyle.fontFamily.medium,
          }}
        >
          {errorMessage}
        </Text>
      ) : null}

      {/* Password strength meter (only password-new) */}
      {mode === 'password-new' && value ? (
        <View style={{ marginTop: 10 }}>
          {/* Track */}
          <View
            style={{
              height: 10,
              width: '100%',
              borderRadius: 999,
              backgroundColor: hexToRgba(themeStyle.colors.black, 0.15),
              overflow: 'hidden',
            }}
          >
            {/* Fill */}
            <View
              style={{
                height: '100%',
                width: `${strength.percent}%`,
                backgroundColor: strength.color || themeStyle.colors.fail,
                borderRadius: 999,
              }}
            />
          </View>

          {/* Label */}
          <Text
            style={{
              marginTop: 6,
              color: strength.color || themeStyle.colors.fail,
              fontSize: themeStyle.fontSize.data_text,
              fontFamily: themeStyle.fontFamily.bold,
            }}
          >
            {strength.label}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default TextFieldModal;
