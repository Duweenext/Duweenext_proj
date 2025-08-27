import { useEffect, useCallback, useReducer } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Only import SecureStore on native platforms
let SecureStore: any = null;
if (Platform.OS !== 'web') {
  SecureStore = require('expo-secure-store');
}

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null],
): UseStateHook<T> {
  return useReducer(
    (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

// ✅ Platform-specific storage functions
export async function setStorageItemAsync(key: string, value: string | null) {
  try {
    if (value == null) {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } else {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    }
  } catch (error) {
    console.error(`Error setting storage item ${key}:`, error);
    throw error;
  }
}

export async function getItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error(`Error getting storage item ${key}:`, error);
    return null;
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error(`Error removing storage item ${key}:`, error);
  }
}

export function useStorageState(key: string): UseStateHook<string> {
  const [state, setState] = useAsyncState<string>();

  useEffect(() => {
    getItem(key).then(value => {
      setState(value);
    }).catch(error => {
      console.error(`Error getting storage item ${key}:`, error);
      setState(null);
    });
  }, [key]);

  const setValue = useCallback(
    async (value: string | null) => {
      try {
        setState(value);
        await setStorageItemAsync(key, value);
      } catch (error) {
        console.error(`Error setting storage item ${key}:`, error);
      }
    },
    [key]
  );

  return [state, setValue];
}