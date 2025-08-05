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
  Weak: '#ef4444',   // red-500
  Medium: '#facc15', // yellow-400
  Strong: '#22c55e', // green-500
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

  const isPassword = type === 'password';
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

  return (
    <View className="w-full px-4 py-4 bg-purple-200 rounded-lg">
      {/* Label */}
      <Text className="text-white font-bold text-lg mb-2">{name}</Text>

      {/* Hint with tooltip toggle */}
      {hint && (
        <View className="flex-row items-center mb-1">
          <Text className="text-white mr-2">{hint}</Text>
          {isPassword && showStrengthRules && (
            <Pressable onPress={() => setShowRules(!showRules)}>
              <Text className="text-white text-lg">ⓘ</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Password Rules */}
      {showRules && (
        <View className="bg-white p-3 rounded-xl mb-3 w-[90%] self-center">
          <Text className="text-black font-semibold">Recommended password format</Text>
          <Text className="text-black mt-1">• At least one number</Text>
          <Text className="text-black">• At least one uppercase</Text>
          <Text className="text-black">• At least one lowercase</Text>
          <Text className="text-black">• At least 8 characters</Text>
          <Text className="text-black">• At least one special character</Text>
        </View>
      )}

      {/* Text Field */}
      <View
        style={{ width, height, borderRadius }}
        className="flex-row items-center bg-white px-4"
      >
        <TextInput
          style={{
            flex: 1,
            height: '70%',
            fontSize: 16,
            fontFamily: 'RobotoCondensed_400Regular',
          }}
          className="text-black"
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          secureTextEntry={isPassword && !isPasswordVisible}
          keyboardType={type === 'email' ? 'email-address' : 'default'}
          autoCapitalize={type === 'email' ? 'none' : 'sentences'}
          value={value}
          onChangeText={onChangeText}
        />

        {/* Eye Icon (only for passwords) */}
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

      {/* Strength bar */}
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
            className="mt-1 text-sm font-semibold"
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
