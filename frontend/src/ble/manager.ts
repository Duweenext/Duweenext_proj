import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { BleManager } from 'react-native-ble-plx';

export const isWeb = Platform.OS === 'web';
export const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Make the type explicit so TS knows this is a union
export type BleManagerMaybe = BleManager | null;

// Only create the native manager when supported
export const bleManager: BleManagerMaybe = !isWeb && !isExpoGo ? new BleManager() : null;
