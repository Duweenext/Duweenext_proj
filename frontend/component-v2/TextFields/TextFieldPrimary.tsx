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

type Strength = 'Weak' | 'Medium' | 'Strong';

type Props = {
  name: string;
  hint?: string;
  placeholder?: string;
  icon?: boolean;
  strengthIndicator?: boolean;
  showStrengthRules?: boolean;
  type?: 'text' | 'email' | 'password';
  width?: number;
  height?: number;
  borderRadius?: number;
  value: string;
  onChangeText: (text: string) => void;
};

const getStrength = (text: string): Strength => {
  const hasNumber = /\d/.test(text);
  const hasUpper = /[A-Z]/.test(text);
  const hasLower = /[a-z]/.test(text);
  const hasSpecial = /[^A-Za-z0-9]/.test(text);
  const isLongEnough = text.length >= 8;

  const score = [hasNumber, hasUpper, hasLower, hasSpecial, isLongEnough].filter(Boolean).length;

  if (score === 5) return 'Strong';
  if (score >= 3) return 'Medium';
  return 'Weak';
};

const strengthColorMap: Record<Strength, string> = {
  Weak: '#F77979',
  Medium: '#F2BC79',
  Strong: '#A6F98D',
};

const strengthPercentMap: Record<Strength, number> = {
  Weak: 0.25,
  Medium: 0.66,
  Strong: 1,
};

const TextFieldPrimary: React.FC<Props> = ({
  name,
  hint,
  placeholder = '',
  icon = true,
  strengthIndicator = true,
  showStrengthRules = true,
  type = 'text',
  width = 325,
  height = 60,
  borderRadius = 15,
  value,
  onChangeText,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [localValue, setLocalValue] = useState(value);

  const isPassword = type === 'password';
  const isEmail = type === 'email';
  const isText = type === 'text';

  const strength = getStrength(value);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isPassword || !strengthIndicator) return;
    const toValue = strengthPercentMap[strength] * width;

    Animated.timing(animatedWidth, {
      toValue,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [strength, value, isPassword, strengthIndicator]);

  const handleInputChange = (text: string) => {
    setLocalValue(text);
    let error = '';

    if (isText) {
      const onlyLetters = /^[A-Za-z\s\-]+$/;
      if (text && !onlyLetters.test(text)) {
        error = 'Should be letters only.';
      }
    } else if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const trimmedText = text.trim().toLowerCase();
      if (text && !emailRegex.test(trimmedText)) {
        error = 'Invalid email format.';
      } else {
        text = trimmedText;
      }
    }

    setErrorMessage(error);
    if (!error || text === '') {
      onChangeText(text);
    }
  };

  return (
    <View className="w-full px-4 py-4 bg-purple-200 rounded-lg">
      <Text className="text-white text-header-3 font-r-semibold mb-2">{name}</Text>

      {hint && (
        <View className="flex-row items-center mb-1">
          <Text className="text-white font-r-regular text-text-field mr-2">{hint}</Text>
          {isPassword && showStrengthRules && (
            <Pressable onPress={() => setShowRules(!showRules)}>
              <Text className="text-white text-header-3">ⓘ</Text>
            </Pressable>
          )}
        </View>
      )}

      {showRules && (
        <View className="bg-white p-3 rounded-xl mb-3 w-[90%] self-center">
          <Text className="text-black font-r-semibold text-text-field">Recommended password format</Text>
          <Text className="text-black mt-1 font-r-regular text-text-field">• At least one number</Text>
          <Text className="text-black font-r-regular text-text-field">• At least one uppercase</Text>
          <Text className="text-black font-r-regular text-text-field">• At least one lowercase</Text>
          <Text className="text-black font-r-regular text-text-field">• At least 8 characters</Text>
          <Text className="text-black font-r-regular text-text-field">• At least one special character</Text>
        </View>
      )}

      <View
        style={{ width, height, borderRadius }}
        className="flex-row items-center bg-white px-4"
      >
        <TextInput
          style={{ flex: 1, height: '70%' }}
          className="text-black font-r-regular text-text-field"
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          secureTextEntry={isPassword && !isPasswordVisible}
          keyboardType={isEmail ? 'email-address' : 'default'}
          autoCapitalize={isEmail ? 'none' : 'sentences'}
          value={localValue}
          onChangeText={handleInputChange}
        />

        {icon && isPassword && (
          <Pressable onPress={() => setIsPasswordVisible(prev => !prev)}>
            {isPasswordVisible ? (
              <EyeOff size={30} color="grey" />
            ) : (
              <Eye size={30} color="grey" />
            )}
          </Pressable>
        )}
      </View>

      {errorMessage ? (
        <Text className="text-fail text-text-field font-r-regular mt-1">{errorMessage}</Text>
      ) : null}

      {isPassword && strengthIndicator && (
        <View className="mt-2" style={{ width }}>
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
            className="mt-1 font-r-semibold text-text-field"
            style={{ color: strengthColorMap[strength] }}
          >
            {strength}
          </Text>
        </View>
      )}
    </View>
  );
};

export default TextFieldPrimary;
