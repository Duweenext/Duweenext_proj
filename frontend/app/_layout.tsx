import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View } from 'react-native';
import './globals.css';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkToken = async () => {
      const token = await SecureStore.getItemAsync('token');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    checkToken();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const inAuthGroup = segments[0] === 'auth';

      if (!isAuthenticated && !inAuthGroup) {
        router.replace('/auth/welcome');
      } else if (isAuthenticated && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [isLoading, isAuthenticated, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}
