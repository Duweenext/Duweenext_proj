// PasswordRules.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { themeStyle } from '@/src/theme';

export type RulesCardProps = {
  title: string;
  description?: string;
  rules: string[];
};

export default function RulesCard({ title, description, rules }: RulesCardProps) {
  return (
    <View
      style={{
        backgroundColor: themeStyle.colors.white,
        padding: 4,
        // borderRadius: 12,
        marginTop: 8,
        maxWidth: 300,
        // alignSelf: 'center',
      }}
    >
      {/* Title */}
      <Text style={{ fontWeight: '600', marginBottom: 6, color: themeStyle.colors.black }}>
        {title}
      </Text>

      {/* Description */}
      {description ? (
        <Text
          style={{
            marginBottom: 8,
            color: themeStyle.colors.black,
            fontSize: themeStyle.fontSize.data_text,
            
          }}
        >
          {description}
        </Text>
      ) : null}

      {/* Bullet list */}
      {rules.map((rule, idx) => (
        <Text key={idx} style={{ color: themeStyle.colors.black, marginTop: 2 }}>
          • {rule}
        </Text>
      ))}
    </View>
  );
}
