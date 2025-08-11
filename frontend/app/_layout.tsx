// app/_layout.tsx
import React from 'react';
import { ImageBackground } from 'react-native';
import { Slot } from 'expo-router';
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <PaperProvider>
      <ImageBackground
        source={require('../assets/images/background.png')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        <Slot />
      </ImageBackground>
    </PaperProvider>
  );
}
