import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  TextInput,
  View,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import {
  getPasswordStrength,
  validateEmail,
  validateText,
  strengthColorMap,
  strengthPercentMap,
} from '../../src/utlis/input';

type PasswordVariant = 'default' | 'old' | 'confirm';

type Props = {
  name: string;
  hint?: string;
  placeholder?: string;
  icon?: boolean;
  strengthIndicator?: boolean;   // respected only for passwordVariant 'default'
  showStrengthRules?: boolean;   // respected only for passwordVariant 'default'
  type?: 'text' | 'email' | 'password';
  /** New: pick a password variant when type === 'password' */
  passwordVariant?: PasswordVariant;
  /** New: value to compare to when passwordVariant === 'confirm' */
  confirmWith?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  value: string;
  onChangeText: (text: string) => void;
  /** Optional callback to expose match state for confirm variant */
  onMatchChange?: (matched: boolean) => void;
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

  // animate strength bar
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

  // confirm variant: report match state upward if requested
  const isConfirm = isPassword && passwordVariant === 'confirm';
  const matched =
    isConfirm && localValue.length > 0 ? localValue === confirmWith : false;

  useEffect(() => {
    if (isConfirm && onMatchChange) {
      onMatchChange(matched);
    }
  }, [isConfirm, matched, onMatchChange]);

  const handleInputChange = (text: string) => {
    setLocalValue(text);
    let error = '';

    if (isText) {
      error = validateText(text);
    } else if (isEmail) {
      const { error: emailError, cleaned } = validateEmail(text);
      error = emailError;
      text = cleaned;
    }
    setErrorMessage(error);
    if (!error || text === '') {
      onChangeText(text);
    }
  };

  // ----- dynamic border color logic -----
  const baseBorder = '#d1d5db';     // gray-300
  const focusBorder = '#3b82f6';    // blue-500
  const errorBorder = '#ef4444';    // red-500
  const successBorder = '#22c55e';  // green-500

  let borderColor = baseBorder;

  if (errorMessage) borderColor = errorBorder;

  if (isPassword) {
    if (passwordVariant === 'confirm') {
      if (localValue.length > 0) {
        borderColor = matched ? successBorder : errorBorder;
      }
    } else if (isFocused) {
      borderColor = focusBorder;
    }
  } else if (isFocused) {
    borderColor = focusBorder;
  }

  // show/hide eye icon only for password inputs
  const showEye = icon && isPassword;

  // variant flags
  const showStrengthUI = isPassword && passwordVariant === 'default' && strengthIndicator;
  const showRulesUI = isPassword && passwordVariant === 'default' && showStrengthRules;

  return (
    <View style={{ width: '100%', paddingHorizontal: 16, paddingVertical: 10 }}>
      <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
        {name}
      </Text>

      {hint && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ color: 'white', fontSize: 14, marginRight: 8 }}>{hint}</Text>
          {showRulesUI && (
            <Pressable onPress={() => setShowRules(!showRules)}>
              <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>ⓘ</Text>
            </Pressable>
          )}
        </View>
      )}

      {showRulesUI && showRules && (
        <View
          style={{
            backgroundColor: 'white',
            padding: 12,
            borderRadius: 12,
            marginBottom: 12,
            width: '90%',
            alignSelf: 'center',
          }}
        >
          <Text style={{ color: 'black', fontWeight: '600', fontSize: 14 }}>
            Recommended password format
          </Text>
          <Text style={{ color: 'black', fontSize: 14, marginTop: 4 }}>• At least one number</Text>
          <Text style={{ color: 'black', fontSize: 14 }}>• At least one uppercase</Text>
          <Text style={{ color: 'black', fontSize: 14 }}>• At least one lowercase</Text>
          <Text style={{ color: 'black', fontSize: 14 }}>• At least 8 characters</Text>
          <Text style={{ color: 'black', fontSize: 14 }}>• At least one special character</Text>
        </View>
      )}

      <View
        style={{
          width,
          height,
          borderRadius,
          paddingHorizontal: 10,
          backgroundColor: 'white',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 2,
          borderColor,
        }}
      >
        <TextInput
          style={{ flex: 1, fontSize: 16, height: 50, color: 'black' }}
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

      {/* validation message */}
      {errorMessage ? (
        <Text style={{ color: '#F77979', fontSize: 14, marginTop: 4 }}>{errorMessage}</Text>
      ) : null}

      {/* strength UI for default password variant */}
      {showStrengthUI && (
        <View style={{ marginTop: 8, width }}>
          <View
            style={{
              height: 8,
              backgroundColor: '#d1d5db',
              borderRadius: 10,
              overflow: 'hidden',
              width,
            }}
          >
            <Animated.View
              style={{
                height: '100%',
                borderRadius: 10,
                backgroundColor: strengthColorMap[strength],
                width: animatedWidth,
              }}
            />
          </View>

          <Text
            style={{
              marginTop: 4,
              fontWeight: '600',
              fontSize: 14,
              color: strengthColorMap[strength],
            }}
          >
            {strength}
          </Text>
        </View>
      )}

      {/* confirm UI: matched/unmatched */}
      {isConfirm && localValue.length > 0 && (
        <Text
          style={{
            marginTop: 6,
            fontWeight: '700',
            fontSize: 14,
            color: matched ? '#22c55e' : '#ef4444',
          }}
        >
          {matched ? 'Matched' : 'Passwords do not match'}
        </Text>
      )}
    </View>
  );
};

export default TextFieldPrimary;
