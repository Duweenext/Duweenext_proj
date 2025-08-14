import { useEffect, useCallback, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null],
): UseStateHook<T> {
  return useReducer(
    (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (value == null) {
    await AsyncStorage.removeItem(key);
  } else {
    await AsyncStorage.setItem(key, value);
  }
}

export function useStorageState(key: string): UseStateHook<string> {
  const [state, setState] = useAsyncState<string>();

  useEffect(() => {
    AsyncStorage.getItem(key).then(value => {
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