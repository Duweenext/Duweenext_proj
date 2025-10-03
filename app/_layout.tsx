import React from 'react';
import { ImageBackground, View, Text, Alert } from 'react-native'; // Add Text import
import { Slot } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/src/auth/context/auth_context';
import { getTitleFromPath } from '@/src/utlis/useTitle';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import CustomToast from '@/src/component/Modals/CustomToast';
import messaging from '@react-native-firebase/messaging';
import '@/src/i18n/i18n.config';
import { useDeviceStore } from './(auth)/_local';

SplashScreen.preventAutoHideAsync();

export { getTitleFromPath };

function AppContent() {
  const { isLoading } = useAuth();
  const setDeviceToken = useDeviceStore(state => state.setDeviceToken);

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled = 
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if(enabled)
    {
      console.log('User has enabled notifications');
    }

    return {enabled, authStatus};
  }

  useEffect(() => {
    const requesting = async () => {
      await requestUserPermission().then(({enabled, authStatus}) => {
        if (enabled) {
          messaging().getToken().then(token => {
            setDeviceToken(token);
            console.log('Device FCM Token: ', token);
          });
        }
        else{
          console.log('Permission not granted', authStatus);
        }
      });

      messaging().getInitialNotification().then(async (remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage.notification);
        }
      });

      messaging().onNotificationOpenedApp(async (remoteMessage) => {
        console.log('Notification caused app to open from background state:', remoteMessage.notification);
      });

      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);
      });

      const unsubscribe = messaging().onMessage(async remoteMessage => {
        Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      });

      return unsubscribe;
    }
    requesting();
  }, []);

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 10
      }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={{ flex: 1, width: '100%', height: '100%' }}
      resizeMode="cover"
    >
      <Slot />
      <Toast />
    </ImageBackground>
  );
}

const queryClient = new QueryClient();

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
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider>
          <AuthProvider>
            <AppContent />
            <Toast
              config={{
                customToast: (props) => <CustomToast {...props} />,
                newToast: (props) => <CustomToast {...props} />,
              }}
            />
          </AuthProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}