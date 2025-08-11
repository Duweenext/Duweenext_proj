import React from 'react';
import { View, Text } from 'react-native'; // or 'div', 'p' for web

type Props = {
  title: string;
  subtitle?: string;
};

const MyComponent: React.FC<Props> = ({ title, subtitle }) => {
  return (
    <View style={{ padding: 16, backgroundColor: '#f3f4f6' }}>
      ddd
    </View>
  );
};

export default MyComponent;
