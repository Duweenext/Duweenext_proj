// src/pond/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalysisResult } from './types';

const KEY = 'pond_history_v1';

export async function loadHistory(): Promise<AnalysisResult[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveHistory(items: AnalysisResult[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(items.slice(0, 50))); // keep last 50
}
