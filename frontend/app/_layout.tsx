import React from 'react';
import { ImageBackground, View } from 'react-native';
import { Slot, usePathname } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import '../src/i18n/i18n.config';
import TopBar from '@/component-v2/NavBar/TopBar';
import { AuthProvider, useAuth } from '@/src/auth/context/auth_context';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isLoading } = useAuth();
  const pathname = usePathname();

  // Don't show TopBar on auth screens and loading
  const shouldShowTopBar = !pathname.includes('(auth)') && !isLoading;

  // console.log('shouldShowTopBar:',!pathname.includes('(auth)') );

  // Helper function to get title from pathname
  function getTitleFromPath(pathname: string): string {
    if (pathname === '/' || pathname.includes('(tabs)')) return 'DuWeeNext';
    
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    
    if (lastSegment?.includes('(') && lastSegment?.includes(')')) {
      return 'DuWeeNext';
    }
    
    return lastSegment
      ?.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || 'DuWeeNext';
  }

  const title = getTitleFromPath(pathname);
  const isHomepage = pathname === '/' || pathname.includes('(tabs)');

  // Show loading screen while authentication is being determined
  if (isLoading) {
    return (
      <ImageBackground
        source={require('../assets/images/background.png')}
        style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
        resizeMode="cover"
      >
        <View style={{ padding: 20, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 10 }}>
          {/* Add your loading component here */}
          <Slot />
        </View>
      </ImageBackground>
    );
  }

  return (
    <>
      {/* {shouldShowTopBar && (
        <TopBar
          title={title}
          textColor="#000000"
          showBackButton={!isHomepage}
        />
      )} */}
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