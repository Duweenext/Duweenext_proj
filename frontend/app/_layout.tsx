import React from 'react';
import { ImageBackground, View } from 'react-native';
import { Slot } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/src/auth/context/auth_context';
import TopBar from '@/src/component/NavBar/TopBar';
import { useTitle, getTitleFromPath } from '@/src/hooks/useTitle';

SplashScreen.preventAutoHideAsync();

export { getTitleFromPath };

function AppContent() {
  const { isLoading } = useAuth();
  const title = useTitle();

  if (isLoading) {
    return (
      <ImageBackground
        source={require('@/assets/images/background.png')}
        style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
        resizeMode="cover"
      >
        <View style={{ padding: 20, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 10 }}>
          <Slot />
        </View>
      </ImageBackground>
    );
  }

  return (
    <>
      <ImageBackground
        source={require('../assets/images/background.png')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        <Slot />
      </ImageBackground>
    </>
  );
}

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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </PaperProvider>
  );
}