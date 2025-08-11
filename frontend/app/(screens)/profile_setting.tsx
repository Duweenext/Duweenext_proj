import React from 'react';
import { View, Text } from 'react-native'; // or 'div', 'p' for web

type Props = {
  title: string;
  subtitle?: string; // optional prop
};

const MyComponent: React.FC<Props> = ({ title, subtitle }) => {
  return (
    <View style={{ padding: 16, backgroundColor: 'transparent' }}>
     ddd
    </View>
  );
};

export default MyComponent;
