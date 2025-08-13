import React, { useState, useRef, useEffect } from 'react';
import { Text, TextInput, View, Pressable, Animated, Easing } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import {
  getPasswordStrength,
  validateEmail,
  validateText,
  strengthColorMap,
  strengthPercentMap,
} from '../../src/utlis/input';
import { themeStyle } from '@/src/theme';

type PasswordVariant = 'default' | 'old' | 'confirm';
type ErrorPlacement = 'above' | 'below' | 'topRight';

type Props = {
  name: string;
  hint?: string;
  placeholder?: string;
  icon?: boolean;
  strengthIndicator?: boolean;
  showStrengthRules?: boolean;
  type?: 'text' | 'email' | 'password';
  passwordVariant?: PasswordVariant;
  confirmWith?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  value: string;
  onChangeText: (text: string) => void;
  onMatchChange?: (matched: boolean) => void;
  errorPlacement?: ErrorPlacement;
  externalError?: string;
};

const TextFieldPrimary: React.FC<Props> = ({
  name,
  hint,
  placeholder = '',
  icon = true,
  strengthIndicator = true,
  showStrengthRules = true,
  type = 'text',
  passwordVariant = 'default',
  confirmWith = '',
  width = 325,
  height = 60,
  borderRadius = 10,
  value,
  onChangeText,
  onMatchChange,
  errorPlacement = 'below',
  externalError,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const isEmail = type === 'email';
  const isText = type === 'text';
  const strength = getPasswordStrength(value);

  const animatedWidth = useRef(new Animated.Value(0)).current;

  // Animate password strength bar
  useEffect(() => {
    if (!(isPassword && passwordVariant === 'default' && strengthIndicator)) return;
    const toValue = strengthPercentMap[strength] * width;
    Animated.timing(animatedWidth, {
      toValue,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [strength, value, isPassword, strengthIndicator, passwordVariant, width]);

  // Confirm password match logic
  const isConfirm = isPassword && passwordVariant === 'confirm';
  const matched =
    isConfirm && localValue.length > 0 ? localValue === confirmWith : false;

  useEffect(() => {
    if (isConfirm && onMatchChange) onMatchChange(matched);
  }, [isConfirm, matched, onMatchChange]);

  const handleInputChange = (text: string) => {
    setLocalValue(text);
    let err = '';

    if (isText) {
      err = validateText(text);
    } else if (isEmail) {
      const { error: emailError, cleaned } = validateEmail(text);
      err = emailError;
      text = cleaned;
    }
    setErrorMessage(err);
    if (!err || text === '') onChangeText(text);
  };

  const computedError = externalError || errorMessage;

  // Border color logic
  const baseBorder = '#d1d5db';
  const focusBorder = themeStyle.colors.primary;
  const errorBorder = themeStyle.colors.fail;
  const successBorder = themeStyle.colors.success;

  let borderColor = baseBorder;
  if (computedError) borderColor = errorBorder;
  if (isPassword) {
    if (passwordVariant === 'confirm' && localValue.length > 0) {
      borderColor = matched ? successBorder : errorBorder;
    } else if (isFocused && !computedError) {
      borderColor = focusBorder;
    }
  } else if (isFocused && !computedError) {
    borderColor = focusBorder;
  }

  const showEye = icon && isPassword;
  const showStrengthUI = isPassword && passwordVariant === 'default' && strengthIndicator;
  const showRulesUI = isPassword && passwordVariant === 'default' && showStrengthRules;

  const ErrorText = () =>
    computedError ? (
      <Text
        style={{
          color: themeStyle.colors.fail,
          fontSize: themeStyle.fontSize.data_text,
          fontFamily: themeStyle.fontFamily.medium,
        }}
      >
        {computedError}
      </Text>
    ) : null;

  return (
    <View style={{ width: '100%', paddingHorizontal: 16, paddingVertical: 10 }}>
      {/* Label + optional topRight error */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text
          style={{
            color: themeStyle.colors.white,
            fontSize: themeStyle.fontSize.description,
            fontFamily: themeStyle.fontFamily.semibold,
          }}
        >
          {name}
        </Text>
        <View style = {{marginRight: 27,}}>
        {errorPlacement === 'topRight' && <ErrorText />}
        </View>
      </View>

      {/* Hint + rules */}
      {hint && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ color: themeStyle.colors.white, fontSize: themeStyle.fontSize.data_text, marginRight: 8 }}>
            {hint}
          </Text>
          {showRulesUI && (
            <Pressable onPress={() => setShowRules(!showRules)}>
              <Text style={{ color: themeStyle.colors.white, fontWeight: 'bold' }}>ⓘ</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Rules panel */}
      {showRulesUI && showRules && (
        <View
          style={{
            backgroundColor: themeStyle.colors.white,
            padding: 12,
            borderRadius: 12,
            marginBottom: 12,
            width: '90%',
            alignSelf: 'center',
          }}
        >
          <Text style={{ fontWeight: '600' }}>Recommended password format</Text>
          <Text>• At least one number</Text>
          <Text>• At least one uppercase</Text>
          <Text>• At least one lowercase</Text>
          <Text>• At least 8 characters</Text>
          <Text>• At least one special character</Text>
        </View>
      )}

      {/* Error above input */}
      {errorPlacement === 'above' && <ErrorText />}

      {/* Input container */}
      <View
        style={{
          width,
          height,
          borderRadius,
          paddingHorizontal: 10,
          backgroundColor: themeStyle.colors.white,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 2,
          borderColor,
        }}
      >
        <TextInput
          style={{ flex: 1, height: 50, color: themeStyle.colors.black }}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          secureTextEntry={isPassword && !isPasswordVisible}
          keyboardType={isEmail ? 'email-address' : 'default'}
          autoCapitalize={isEmail ? 'none' : 'sentences'}
          value={localValue}
          onChangeText={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {showEye && (
          <Pressable onPress={() => setIsPasswordVisible((p) => !p)}>
            {isPasswordVisible ? <EyeOff size={26} color="grey" /> : <Eye size={26} color="grey" />}
          </Pressable>
        )}
      </View>

      {/* Error below input */}
      {errorPlacement === 'below' && <ErrorText />}

      {/* Password strength */}
      {showStrengthUI && (
        <View style={{ marginTop: 8}}>
          <View style={{ height: 8, backgroundColor: '#d1d5db', borderRadius: 10, overflow: 'hidden', width }}>
            <Animated.View
              style={{
                height: '100%',
                borderRadius: 10,
                backgroundColor: strengthColorMap[strength],
                width: animatedWidth,
              }}
            />
          </View>
          <Text style={{ marginTop: 4, fontWeight: '600', color: strengthColorMap[strength] }}>
            {strength}
          </Text>
        </View>
      )}

      {/* Confirm password match */}
      {isConfirm && localValue.length > 0 && (
        <Text
          style={{
            marginTop: 6,
            fontWeight: '700',
            color: matched ? themeStyle.colors.success : themeStyle.colors.fail,
          }}
        >
          {matched ? 'Matched' : 'Passwords do not match'}
        </Text>
      )}
    </View>
  );
};

export default TextFieldPrimary;
