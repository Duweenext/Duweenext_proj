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
} from '../../srcs/utlis/input';

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
  borderRadius = 10,
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

  const strength = getPasswordStrength(value);
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

  return (
    <View style={{ width: '100%', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '', borderRadius: 12 }}>
      <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>{name}</Text>

      {hint && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ color: 'white', fontSize: 14, marginRight: 8 }}>{hint}</Text>
          {isPassword && showStrengthRules && (
            <Pressable onPress={() => setShowRules(!showRules)}>
              <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>ⓘ</Text>
            </Pressable>
          )}
        </View>
      )}

      {showRules && (
        <View style={{ backgroundColor: 'white', padding: 12, borderRadius: 12, marginBottom: 12, width: '90%', alignSelf: 'center' }}>
          <Text style={{ color: 'black', fontWeight: '600', fontSize: 14 }}>Recommended password format</Text>
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
        }}
      >
        <TextInput
          style={{ flex: 1, fontSize: 16, height:50, width:300, color: 'black' }}
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
        <Text style={{ color: '#F77979', fontSize: 14, marginTop: 4 }}>{errorMessage}</Text>
      ) : null}

      {isPassword && strengthIndicator && (
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
    </View>
  );
};

export default TextFieldPrimary;
