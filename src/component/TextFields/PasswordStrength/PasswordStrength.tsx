// usePasswordStrength.ts
import { useMemo } from 'react';
import { getPasswordStrength } from '@/src/utlis/passwordStrength';
import { strengthColorMap, strengthPercentMap } from '@/src/utlis/input';

export function usePasswordStrength(password: string) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const color = strengthColorMap[strength];
  const percent = strengthPercentMap[strength];
  return { strength, color, percent };
}

// PasswordStrengthMeter.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

type Props = {
  strength: string;          // e.g., 'Weak' | 'Medium' | 'Strong'
  color: string;
  percent: number;           // 0..1
  width?: number;
  showLabel?: boolean;
};

const PasswordStrengthMeter: React.FC<Props> = ({ strength, color, percent, width = 325, showLabel = true }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percent * width,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [percent, width]);

  return (
    <View >
      <View style={{ height: 6, backgroundColor: '#d1d5db', borderRadius: 10, overflow: 'hidden', width }}>
        <Animated.View style={{ height: '100%', borderRadius: 10, backgroundColor: color, width: animatedWidth }} />
      </View>
      {showLabel && (
        <Text style={{ marginTop: 4, fontWeight: '600', color }}>{strength}</Text>
      )}
    </View>
  );
};

export default PasswordStrengthMeter;
