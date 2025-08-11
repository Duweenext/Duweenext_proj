// app/_layout.tsx
import React from 'react';
import { ImageBackground } from 'react-native';
import { Slot } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import '../src/i18n/i18n.config';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'roboto-condensed-regular': require('../assets/fonts/Roboto_Condensed/RobotoCondensed-Regular.ttf'),
    'roboto-condensed-medium': require('../assets/fonts/Roboto_Condensed/RobotoCondensed-Medium.ttf'),
    'roboto-condensed-semibold': require('../assets/fonts/Roboto_Condensed/RobotoCondensed-SemiBold.ttf'),
    'roboto-condensed-bold': require('../assets/fonts/Roboto_Condensed/RobotoCondensed-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

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
