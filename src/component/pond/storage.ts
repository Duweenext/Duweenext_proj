// src/pond/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { AnalysisResult } from './types';

export const KEY = 'pond_history_v1';
const FILTER_KEY = 'pond_history_filter_v1';

// Keep fewer items on web to avoid localStorage 5MB cap
const MAX_HISTORY_NATIVE = 20;
const MAX_HISTORY_WEB = 8;
const MAX_HISTORY = Platform.OS === 'web' ? MAX_HISTORY_WEB : MAX_HISTORY_NATIVE;

// ---------- helpers ----------
async function safeDeleteFile(uri?: string) {
  if (!uri) return;
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch { /* ignore */ }
}

async function clearImagePickerCacheFolder() {
  try {
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) return;
    const pickerCache = cacheDir + 'ImagePicker/';
    const info = await FileSystem.getInfoAsync(pickerCache);
    if (info.exists) await FileSystem.deleteAsync(pickerCache, { idempotent: true });
  } catch { /* ignore */ }
}

// pack a lean representation for storage (minimize bytes)
type Packed = {
  id: string;
  processedAt: string;
  imageUri: string;
  label: string;
  confidence: number;
  tip?: string;
  mv?: string; // modelVersion (short key)
};

function pack(items: AnalysisResult[]): Packed[] {
  return items.map(i => ({
    id: i.id,
    processedAt: i.processedAt,
    imageUri: i.imageUri,
    label: String(i.label),
    confidence: i.confidence,
    tip: i.tips?.[0],
    mv: i.modelVersion,
  }));
}

function unpack(rows: Packed[] | null | undefined): AnalysisResult[] {
  if (!rows) return [];
  return rows.map(r => ({
    id: r.id,
    processedAt: r.processedAt,
    imageUri: r.imageUri,
    label: r.label,
    confidence: r.confidence,
    tips: r.tip ? [r.tip] : [],
    educationLinks: [],
    modelVersion: r.mv || '',
  }));
}

// try setItem, and if quota is hit, drop oldest items until it fits
async function safeSetHistoryPacked(rows: Packed[]) {
  let end = rows.length;
  while (end > 0) {
    const slice = rows.slice(0, end);
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(slice));
      return; // success
    } catch {
      // Quota exceeded → reduce and retry
      end = Math.max(0, end - 1);
      if (end === 0) {
        // give up: clear the key
        await AsyncStorage.removeItem(KEY);
        return;
      }
    }
  }
}

// ---------- public API ----------
export async function loadHistory(): Promise<AnalysisResult[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Packed[];
    return unpack(parsed);
  } catch {
    // corrupted json → clear
    await AsyncStorage.removeItem(KEY);
    return [];
  }
}

/**
 * Save history with pruning & quota safety:
 * - Keep last N (smaller N on web)
 * - Delete files for rolled-off items (best effort)
 * - Store compact form; if quota still exceeded, drop oldest until it fits
 */
export async function saveHistory(items: AnalysisResult[]) {
  const latest = items.slice(0, MAX_HISTORY);
  const rolledOff = items.slice(MAX_HISTORY);

  // delete files for rolled-off items (best effort)
  await Promise.all(rolledOff.map(i => safeDeleteFile(i.imageUri)));

  // store compact rows and shrink-to-fit if needed
  const packed = pack(latest);
  await safeSetHistoryPacked(packed);
}

/** Remove a single history item (and its image file) by id. */
export async function removeHistoryItemById(id: string) {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return;

  let rows: Packed[];
  try {
    rows = JSON.parse(raw) as Packed[];
  } catch {
    await AsyncStorage.removeItem(KEY);
    return;
  }
  const idx = rows.findIndex(r => r.id === id);
  if (idx === -1) return;

  // delete the file for that item
  await safeDeleteFile(rows[idx]?.imageUri);

  // remove and persist (no need to repack; rows already packed)
  rows.splice(idx, 1);
  await safeSetHistoryPacked(rows);
}

/** Clear only the list (visual history). */
export async function clearHistoryOnly() {
  await AsyncStorage.removeItem(KEY);
}

/** Clear list AND try to delete all image files; also wipe ImagePicker cache. */
export async function clearHistoryAndFiles() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      try {
        const rows = JSON.parse(raw) as Packed[];
        await Promise.all(rows.map(r => safeDeleteFile(r.imageUri)));
      } catch { /* ignore */ }
    }
  } finally {
    await AsyncStorage.removeItem(KEY);
    await clearImagePickerCacheFolder();
  }
}

/** Optional: save with a custom cap at runtime (uses same shrink-to-fit). */
export function createSaveHistoryWithLimit(limit: number) {
  return async function saveHistoryLimited(items: AnalysisResult[]) {
    const keep = Math.max(1, limit);
    const latest = items.slice(0, keep);
    const rolledOff = items.slice(keep);
    await Promise.all(rolledOff.map(i => safeDeleteFile(i.imageUri)));
    await safeSetHistoryPacked(pack(latest));
  };
}

/** (Optional) Persist date filter selections so they survive app restarts. */
export type HistoryFilter = { from?: string; to?: string }; // ISO strings

export async function saveHistoryFilter(filter: HistoryFilter) {
  try {
    await AsyncStorage.setItem(FILTER_KEY, JSON.stringify(filter));
  } catch { /* ignore */ }
}

export async function loadHistoryFilter(): Promise<HistoryFilter> {
  try {
    const raw = await AsyncStorage.getItem(FILTER_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
