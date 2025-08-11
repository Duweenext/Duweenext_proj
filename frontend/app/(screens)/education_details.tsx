import React from 'react';
import { View, Text } from 'react-native'; // or 'div', 'p' for web

type Props = {
  title: string;
  subtitle?: string;
};

const MyComponent: React.FC<Props> = ({ title, subtitle }) => {
  return (
    <View style={{ padding: 16, backgroundColor: '#f3f4f6' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{title}</Text>
      {subtitle && (
        <Text style={{ fontSize: 14, color: '#6b7280' }}>{subtitle}</Text>
      )}
    </View>
  );
};

export default MyComponent;
