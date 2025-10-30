import React, { useState } from 'react';
import { ImageBackground, View, Text } from 'react-native';
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
import messaging from '@react-native-firebase/messaging';
import '@/src/i18n/i18n.config';
import { useDeviceStore } from './(auth)/_local';
import * as Notifications from 'expo-notifications';
import CustomToast from '@/src/component/Notifications/CustomToast';
import SuccessToast from '@/src/component/Notifications/SucceedNotification';
import ErrorToastNotification from '@/src/component/Notifications/ErrorNotification';
import { useLang } from '@/src/api/local/_languageConfig';
import { useTranslation } from 'react-i18next';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

export { getTitleFromPath };

function AppContent() {
  const { isLoading } = useAuth();
  const {lang} = useLang();
  const {i18n} = useTranslation();
  const setDeviceToken = useDeviceStore(state => state.setDeviceToken);

  useEffect(() => {
      i18n.changeLanguage(lang);
  },[])

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      console.log('User has enabled notifications');
    }

    return { enabled, authStatus };
  }

  useEffect(() => {
    const requesting = async () => {
      await requestUserPermission().then(({ enabled, authStatus }) => {
        if (enabled) {
          messaging().getToken().then(token => {
            setDeviceToken(token);
            console.log('Device FCM Token: ', token);
          });
        }
        else {
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
        console.log('A new FCM message arrived in the foreground!', remoteMessage);

        const { title, body } = remoteMessage.notification ?? {};

        if (title && body) {
          Toast.show({
            type: 'customToast',
            text1: title,
            text2: body,
            visibilityTime: 4000,
            props:{
              lottieSource: require('@/assets/animations/Bell ring.json'),
            }
          });
        }
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
      <Toast 
        config={{
          customToast: (props) => <CustomToast {...props} />,
          successToast: (props) => <SuccessToast {...props} />,
          errorToast: (props) => <ErrorToastNotification {...props} />,
        }}
      />
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
                successToast: (props) => <SuccessToast {...props} />,
                errorToast: (props) => <ErrorToastNotification {...props} />,
              }}
            />
          </AuthProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}